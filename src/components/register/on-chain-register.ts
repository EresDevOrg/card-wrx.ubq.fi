import { ethers } from "ethers";
import { AccessToken } from "../../../functions/shared";
import { backendBaseUrl } from "../../constants";
import { appState } from "../../main";
import { wirexPayChain, wirexPayChainTestnet } from "../../shared/wirex-pay-chain";
import { showToast } from "../toaster";

export async function registerOnChain(button: HTMLAnchorElement) {
  try {
    const authData = await authenticateUser();
    if (!authData) throw new Error("Error authenticating.");

    const wirexRegisterContract = await setupNetworkAndContract(authData);

    if (!window.ethereum) {
      alert("Please install a Web3 wallet like MetaMask to continue.");
      return false;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const isRegistered = await checkUserRegistration(provider, wirexRegisterContract);

    if (isRegistered) {
      showToast({ message: "User already registered on-chain. Proceeding to next step." });
      return true;
    } else {
      await registerNewUser(provider, wirexRegisterContract);
    }
  } finally {
    button.style.pointerEvents = "auto"; // Re-enable clicks
  }
}

async function authenticateUser() {
  const authUrl = `${backendBaseUrl}/auth`;
  const authResponse = await fetch(authUrl, { method: "GET" });
  const responseJson = await authResponse.json();

  if (authResponse.status !== 200) {
    showToast({ message: "Error authenticating.", type: "error" });
    console.error("Error authenticating: ", responseJson);
    return null;
  }
  return responseJson;
}

async function setupNetworkAndContract(responseJson: AccessToken) {
  const isSandbox = responseJson.isSandbox;
  await appState.switchNetwork(isSandbox ? wirexPayChainTestnet : wirexPayChain);

  return isSandbox ? "0x3fe04562Fc28b4152F24A41E8A8c3899E6B8c433" : "0x2766F66E572C94a4cbc57f4d5bd2aD71900edF30";
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
