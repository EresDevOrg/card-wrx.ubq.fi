import { appState } from "../../main";
import { authenticateUser, getUserAuthToken, getUserAuthToken2 } from "../../shared/user-auth";
import { showToast } from "../toaster";
import { getSupportedCountriesHtml } from "./countries-dropdown";
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

let currentStep = RegistrationStep.INITIAL;

let smsResponse: SmsResponse | null = null;

export function getRegisterHtml(): string {
  return `
    <div class="demo-card">
      <div id="step-1">
        
        <h3>Registration Steps</h3>
        <ol class="register-steps">
          <li>Register on-chain</li>
          <li>Register on the app</li>
          <li>KYC</li>
          <li>Verify phone number</li>
        </ol>

        <h1>Get Started</h1>
        <div>
        <div>Select your country of residence:</div>
            ${getSupportedCountriesHtml()}
        </div>
        <h3><a href="javascript:;" id="register">Step-1: Click here to register on-chain</a></h3>
        
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
        <div id="kyc-link"></div>
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

export function addRegisterEvents() {
  fillPreviousRegisterAttempt();

  document.getElementById("register")?.addEventListener("click", (event) => {
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

  document.getElementById("email-registration-form")?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (currentStep !== RegistrationStep.ON_CHAIN_REGISTERED) {
      showToast({ message: "Please complete the previous step first.", type: "error" });
      return;
    }

    (async () => {
      let success;
      try {
        success = await registerOnApp();
        if (success) {
          updateStep2Ui();
        } else {
          showToast({ message: "Error registering with API.", type: "error" });
        }
      } catch (error) {
        console.error(error);
      }
    })().catch(console.error);
  });

  document.getElementById("next-phone")?.addEventListener("click", (event) => {
    event.preventDefault();

    const wallet = appState.getAddress();
    if (wallet) {
      authenticateUser(wallet)
        .then(() => {
          const auth = getUserAuthToken();
          if (auth.user.verification_status !== "Approved") {
            showToast({ message: "Please complete KYC before next step.", type: "error" });
            return;
          }

          updateStep3Ui();
        })
        .catch(console.error);
    }
  });

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

function fillPreviousRegisterAttempt() {
  const auth = getUserAuthToken2();

  if (auth?.user.residence_address.country) {
    const countryDropdown = document.getElementById("country-dropdown") as HTMLSelectElement;
    const country = auth.user.residence_address.country;
    const option = Array.from(countryDropdown.options).find((opt) => {
      return opt.value === country;
    });

    if (option) {
      countryDropdown.value = option.value;
      countryDropdown.disabled = true;
    }
  }

  if (auth?.user.email) {
    const emailInput = document.getElementById("email") as HTMLInputElement;
    emailInput.value = auth.user.email;
    emailInput.disabled = true;
  }
}
