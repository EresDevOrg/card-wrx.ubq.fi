import { ethers } from "ethers";
import { appState } from "../main";
import { wirexPayChain, wirexPayChainTestnet } from "../shared/wirex-pay-chain";
import { AccessToken } from "../../functions/shared";
import { showToast } from "./toaster";

// Step states
enum RegistrationStep {
  INITIAL,
  ON_CHAIN_REGISTERED,
  API_REGISTERED,
}

const backendBaseUrl = "";

let currentStep = RegistrationStep.INITIAL;

export function newUser(): string {
  return `
    <div class="demo-card">
      <div id="step-1">
        <svg width="300" height="190" xmlns="http://www.w3.org/2000/svg">
          <!-- Gradient Background -->
          <defs>
            <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1A1F71;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#6A0DAD;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Card Background -->
          <rect x="10" y="10" width="280" height="170" rx="10" fill="url(#cardGradient)" stroke="#000" stroke-width="2"/>

          <!-- Visa Logo -->
          <text x="230" y="40" font-family="Arial" font-size="20" font-weight="bold" fill="#FFFFFF" stroke="#000" stroke-width="0.5">VISA</text>

          <!-- Main Brand Name -->
          <text x="20" y="80" font-family="Arial" font-size="24" font-weight="bold" fill="#FFFFFF" stroke="#000" stroke-width="0.5">UbiquiCard</text>

          <!-- Card Number -->
          <text x="20" y="120" font-family="Arial" font-size="16" fill="#FFFFFF" stroke="#000" stroke-width="0.5">1234 5678 9012 3456</text>

          <!-- Name -->
          <text x="20" y="150" font-family="Arial" font-size="14" fill="#FFFFFF" stroke="#000" stroke-width="0.5">Mr. Awesome</text>

          <!-- Powered by WirexPayChain -->
          <text x="20" y="170" font-family="Arial" font-size="10" fill="#FFFFFF" stroke="#000" stroke-width="0.3">Powered by WirexPayChain</text>
        </svg>
       
        <h2><a href="javascript:;" id="register">Get your UbiquiCard</a></h2>
      </div>
      
      <div id="step-2" style="display: none;">
        <h2>Complete Your Registration</h2>
        <p>You're almost there! Please provide your email to complete the registration process.</p>
        <form id="email-registration-form">
          <div>
            <label for="email">Email Address:</label>
            <input type="email" id="email" name="email" required placeholder="Enter your email">
          </div>
          <div style="margin-top: 15px;">
            <button type="submit" id="submit-email">Complete Registration</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

const totalRegistrationSteps = 2;

export function handleNewUserEvents() {
  // Step 1: On-chain registration
  document.getElementById("register")?.addEventListener("click", (event) => {
    showToast({ message: `Step 1/${totalRegistrationSteps}: Register on chain.` });
    const button = event.currentTarget as HTMLAnchorElement;
    button.style.pointerEvents = "none"; // Disable further clicks
    (async () => {
      try {
        await registerOnChain(button);
      } catch (error) {
        console.error(error);
      }
      button.style.pointerEvents = "auto"; // Re-enable clicks
    })().catch(console.error);
  });

  // Step 2: API registration with email
  document.getElementById("email-registration-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast({ message: `Step 2/${totalRegistrationSteps}: Register on wirex.` });
    registerOnApp().catch(console.error);
  });
}

async function registerOnChain(button: HTMLAnchorElement) {
  try {
    const authData = await authenticateUser();
    if (!authData) return;

    const wirexRegisterContract = await setupNetworkAndContract(authData);

    if (!window.ethereum) {
      alert("Please install a Web3 wallet like MetaMask to continue.");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const isRegistered = await checkUserRegistration(provider, wirexRegisterContract);

    if (isRegistered) {
      console.log("User already registered on-chain, proceeding to step 2");
      updateRegistrationUi();
    } else {
      await registerNewUser(provider, wirexRegisterContract);
    }
  } finally {
    button.style.pointerEvents = "auto"; // Re-enable clicks
  }
}

async function registerOnApp() {
  if (currentStep !== RegistrationStep.ON_CHAIN_REGISTERED) {
    alert("Please complete step 1 first.");
    return;
  }

  const emailInput = document.getElementById("email") as HTMLInputElement;
  const email = emailInput.value.trim();

  if (!email) {
    alert("Please enter a valid email address.");
    return;
  }

  // Get user's wallet address
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    // Get sandbox status
    const backendBaseUrl = "";
    const authUrl = `${backendBaseUrl}/auth`;
    await fetch(authUrl, { method: "GET" });

    // Register user with API
    const isSuccess = await registerUserWithApi(email, userAddress);

    if (isSuccess) {
      currentStep = RegistrationStep.API_REGISTERED;
      alert("Registration complete! Your UbiquiCard will be available soon.");
      // Here you could redirect to a success page or show a success message
    }
  } else {
    alert("Please install a Web3 wallet like MetaMask to continue.");
  }
}

// Check if user is already registered on-chain
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

    // AccountStatus enum: 0 = NOT_CREATED, 1 = CREATED, 2 = SUSPENDED
    // We consider the account registered if status is CREATED (1) or SUSPENDED (2)
    const accountStatus = accountInfo.status;
    console.log(`Account status: ${accountStatus}`);
    return accountStatus > 0; // If status > 0, account exists
  } catch (error) {
    console.error("Error checking registration:", error);
    return false;
  }
}

// Register user with API
async function registerUserWithApi(email: string, userAddress: string): Promise<boolean> {
  try {
    // API endpoint from WirexPayChain partner documentation

    const response = await fetch(`${backendBaseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email,
        wallet_address: userAddress,
        country: "DE", // Add any other required fields based on the API documentation
        // Add any other required fields based on the API documentation
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("API registration successful:", data);
    return true;
  } catch (error) {
    console.error("Error registering with API:", error);
    alert(`Error registering with API: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function authenticateUser() {
  const authUrl = `${backendBaseUrl}/auth`;
  const authResponse = await fetch(authUrl, { method: "GET" });
  const responseJson = await authResponse.json();

  if (authResponse.status !== 200) {
    alert(`Error authenticating: ${responseJson}`);
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

function updateRegistrationUi() {
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");
  if (step1) step1.style.display = "none";
  if (step2) step2.style.display = "block";
  currentStep = RegistrationStep.ON_CHAIN_REGISTERED;
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
  await tx.wait();

  alert("Successfully registered on-chain! Please complete step 2.");
  updateRegistrationUi();
}
