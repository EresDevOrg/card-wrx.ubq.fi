import { appState } from "../../main";
import { authenticateUser, getUserAuthToken } from "../../shared/user-auth";
import { showToast } from "../toaster";
import { getKycLink } from "./kyc";
import { registerOnApp } from "./on-app-register";
import { registerOnChain } from "./on-chain-register";
import { registerPhone, SmsResponse, verifyPhone } from "./phone-register";

// Step states
export enum RegistrationStep {
  INITIAL,
  ON_CHAIN_REGISTERED,
  API_REGISTERED,
  KYC,
  PHONE_REGISTERED,
}

const totalRegistrationSteps = 4;

let currentStep = RegistrationStep.INITIAL;

let smsResponse: SmsResponse | null = null;

export function register(): string {
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
       
        <h2><a href="javascript:;" id="register">Register to get your UbiquiCard</a></h2>
       
      </div>
      
      <div id="step-2" style="display: none;">
        <h2>Register Email</h2>
        <p>Please provide your email to complete the registration process.</p>
        <form id="email-registration-form">
          <div>
            <label for="email">Email Address:</label>
            <input type="email" id="email" name="email" required placeholder="Enter your email">
          </div>
          <div style="margin-top: 15px;">
            <button type="submit" id="submit-email">Submit</button>
          </div>
        </form>
      </div>

      <div id="step-3" style="display: none;">
        <h2>KYC</h2>
        <p>Follow the link below to do your KYC. After finishing your KYC, click Next.</p>
        <div style="margin-top: 15px;">
          <button type="submit" id="next-phone">Next</button>
        </div>
      </div>


      <div id="step-4" style="display: none;">
        <h2>Register your phone number</h2>
        <p>You're almost there! Please provide your phone number to complete the registration process.</p>
        <form id="phone-registration-form">
          <div>
            <label for="phone">Phone Number:</label>
            <input type="tel" id="phone" name="phone" required placeholder="Enter your phone number">
          </div>
          <div style="display: none;">
            <label for="phone-confirmation-code">Insert code sent to your phone number:</label>
            <input type="text" id="phone-confirmation-code" name="phone" placeholder="Enter your phone confirmation code">
          </div>
          <div style="margin-top: 15px;">
            <button type="submit" id="submit-phone">Submit</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function handleRegisterEvents() {
  // Step 1: On-chain registration
  document.getElementById("register")?.addEventListener("click", (event) => {
    showToast({ message: `Step 1/${totalRegistrationSteps}: Register on chain.` });
    const button = event.currentTarget as HTMLAnchorElement;
    button.style.pointerEvents = "none"; // Disable further clicks
    (async () => {
      try {
        await registerOnChain(button);
        updateStep1Ui();
      } catch (error) {
        console.error(error);
      }

      button.style.pointerEvents = "auto"; // Re-enable clicks
    })().catch(console.error);
  });

  // Step 2: API registration with email
  document.getElementById("email-registration-form")?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (currentStep !== RegistrationStep.ON_CHAIN_REGISTERED) {
      showToast({ message: "Please complete the previous step first.", type: "error" });
      return;
    }
    showToast({ message: `Step 2/${totalRegistrationSteps}: Register on wirex.` });

    (async () => {
      let success;
      try {
        success = await registerOnApp();
        if (success) {
          updateStep2Ui();
        } else {
          updateStep2Ui(); // delete this, keeping it for testing for now
          showToast({ message: "Error registering with API.", type: "error" });
        }
      } catch (error) {
        console.error(error);
      }
    })().catch(console.error);
  });

  // Step 2: API registration with email
  document.getElementById("next-phone")?.addEventListener("click", (event) => {
    event.preventDefault();

    const wallet = appState.getAddress();
    if (wallet) {
      authenticateUser(wallet)
        .then(() => {
          const auth = getUserAuthToken();
          if (auth?.user.verification_status !== "Applied") {
            showToast({ message: "Please complete KYC before phone verification.", type: "error" });
            return;
          }

          updateStep3Ui();
        })
        .catch(console.error);
    }
  });

  // Step 2: API registration with email
  document.getElementById("phone-registration-form")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const phoneNo = document.getElementById("phone") as HTMLInputElement;
    if (!phoneNo) {
      showToast({ message: `Phone number is required.`, type: "error" });
      return;
    }
    phoneNo.setAttribute("disabled", "true");

    const phoneDivs = document.getElementById("phone-registration-form")?.children;

    if (phoneDivs?.[1]) {
      (phoneDivs[1] as HTMLElement).style.display = "block";
    }

    (async () => {
      try {
        if (smsResponse) {
          const isSuccess = await verifyPhone(smsResponse);
          if (isSuccess) {
            showToast({ message: "Your phone number has been verified.", type: "success" });
            //updateStep3Ui();
            const wallet = appState.getAddress();
            if (wallet) {
              await authenticateUser(wallet);
            }
          } else {
            showToast({ message: "Invalid verification code. ", type: "error" });
          }
        } else {
          showToast({ message: `Step 4/${totalRegistrationSteps}: Register your phone number.` });
          smsResponse = await registerPhone(phoneNo.value);
          showToast({ message: "An SMS has been sent to you.", type: "success" });
          //updateStep3Ui();
        }
      } catch (error) {
        console.error(error);
      }
    })().catch(console.error);
  });
}

export function updateStep1Ui() {
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");
  if (step1) step1.style.display = "none";
  if (step2) step2.style.display = "block";
  currentStep = RegistrationStep.ON_CHAIN_REGISTERED;
}

export function updateStep2Ui() {
  getKycLink().catch(console.error);
  const step2 = document.getElementById("step-2");
  const step3 = document.getElementById("step-3");
  if (step2) step2.style.display = "none";
  if (step3) step3.style.display = "block";
  currentStep = RegistrationStep.API_REGISTERED;
}

export function updateStep3Ui() {
  const step3 = document.getElementById("step-3");
  const step4 = document.getElementById("step-4");
  if (step3) step3.style.display = "none";
  if (step4) step4.style.display = "block";
  currentStep = RegistrationStep.KYC;
}
