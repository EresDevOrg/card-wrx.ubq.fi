import { ethers } from "ethers";
import { backendBaseUrl, wirexAccountContractAddress } from "../../constants";
import { appState } from "../../main";
import { wirexPayChain, wirexPayChainTestnet } from "../../shared/wirex-pay-chain";
import { showToast } from "../toaster";

export async function registerOnChain(button: HTMLButtonElement) {
  try {
    if (!window.ethereum) {
      alert("Please install a Web3 wallet like MetaMask to continue.");
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

async function getEnv() {
  const authUrl = `${backendBaseUrl}/get-env`;
  const envResponse = await fetch(authUrl, { method: "GET" });
  const responseJson: { isSandbox: boolean } = await envResponse.json();

  if (envResponse.status !== 200) {
    showToast({ message: "Error getting env.", type: "error" });
    console.error("Error getting env: ", responseJson);
    return null;
  }
  return responseJson;
}

async function registerNewUser(provider: ethers.providers.JsonRpcProvider, contractAddress: string) {
  const signer = provider.getSigner();
  const wirexContractAbi = [
    {
      type: "function",
      name: "createAccount",
      constant: false,
      payable: false,
      inputs: [],
      outputs: [],
    },
  ];

  const wirexContract = new ethers.Contract(contractAddress, wirexContractAbi, signer);
  const tx = await wirexContract.createAccount();
  const receipt = await tx.wait();
  if (receipt.status === 1) {
    showToast({ message: "Successfully registered on-chain! Please complete step 2." });
    return true;
  } else {
    showToast({ message: "Error registering on chain. Check on block explorer." });
    return false;
  }
}

async function checkUserRegistration(provider: ethers.providers.Web3Provider, contractAddress: string): Promise<boolean> {
  try {
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    // ABI for checking if user is registered
    const checkRegistrationAbi = [
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        name: "getAccount",
        outputs: [
          {
            components: [
              {
                internalType: "enum IAccounts.AccountStatus",
                name: "status",
                type: "uint8",
              },
              {
                internalType: "enum IAccounts.AccountVerificationStatus",
                name: "verificationStatus",
                type: "uint8",
              },
            ],
            internalType: "struct IAccounts.Account",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ];

    const contract = new ethers.Contract(contractAddress, checkRegistrationAbi, provider);
    const accountInfo = await contract.getAccount(userAddress);

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
