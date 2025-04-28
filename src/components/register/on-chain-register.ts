import { ethers } from "ethers";
import { wirexAccountContractAddress } from "../../constants";
import { appState } from "../../main";
import { wirexPayChain, wirexPayChainTestnet } from "../../shared/wirex-pay-chain";
import { showToast } from "../toaster";
import { getEnv } from "../../shared/utils";
import { wirexAccountContractAbi } from "../../shared/wirex-account-contract-abi";

const wirexParentEntity = "0x00000000000000000000000000000014";

export async function registerOnChain(button: HTMLButtonElement) {
  try {
    if (!window.ethereum) {
      showToast({ message: "Please install a Web3 wallet like MetaMask to continue.", type: "error" });
      return false;
    }

    const envData = await getEnv();
    if (!envData) throw new Error("Error getting env.");

    await appState.switchNetwork(envData.isSandbox ? wirexPayChainTestnet : wirexPayChain);

    const chainId = appState.getChainId();
    if (!chainId) {
      showToast({ message: "Error getting chain ID.", type: "error" });
      return false;
    }

    const accountContract = wirexAccountContractAddress[chainId as number];

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const isRegistered = await checkUserRegistration(provider, accountContract);

    if (isRegistered) {
      showToast({ message: "User already registered on-chain. Proceeding to next step." });
      return true;
    } else {
      await registerNewUser(provider, accountContract);
    }
  } finally {
    button.style.pointerEvents = "auto"; // Re-enable clicks
  }
}

async function registerNewUser(provider: ethers.providers.JsonRpcProvider, contractAddress: string) {
  const signer = provider.getSigner();
  const wirexContract = new ethers.Contract(contractAddress, wirexAccountContractAbi, signer);
  const tx = await wirexContract.createUserAccount(wirexParentEntity);
  const receipt = await tx.wait();
  if (receipt.status === 1) {
    showToast({ message: "Successfully registered on-chain! Please complete step 2." });
    return true;
  } else {
    showToast({ message: "Error registering on chain. Check block explorer for details." });
    return false;
  }
}

async function checkUserRegistration(provider: ethers.providers.Web3Provider, contractAddress: string): Promise<boolean> {
  try {
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    const contract = new ethers.Contract(contractAddress, wirexAccountContractAbi, provider);
    const accountInfo = await contract.getUserAccount(userAddress, wirexParentEntity);

    // AccountStatus is a enum for account status
    // - Pending status means that account has been created but not activated and cannot be used
    // - Active status means that account has been activated and can be used
    // - Blocked status means that account has been blocked and cannot be used
    // - Deleted status means that account has been deleted and cannot be used
    // Account status can be changed by the KYC oracle
    //   enum AccountStatus {
    //     UNKNOWN,
    //     PENDING,
    //     ACTIVE,
    //     BLOCKED,
    //     DELETED
    // }
    const accountStatus = accountInfo.status;
    console.log(`Account status: ${accountStatus}`);
    return accountStatus > 0; // If status > 0, account exists
  } catch (error) {
    console.error("Error checking registration:", error);
    return false;
  }
}
