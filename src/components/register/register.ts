import { appState } from "../../main";
import { authenticate, getSession, reauthenticate } from "../../shared/user-session";
import { verifyOtp } from "../../shared/utils";
import { showToast } from "../toaster";
import { getSupportedCountriesHtml } from "./countries-dropdown";
import { getKycLink } from "./kyc";
import { registerOnApp } from "./on-app-register";
import { registerOnChain } from "./on-chain-register";
import { registerPhone, SmsOtpResponse } from "./phone-register";

let smsOtpResponse: SmsOtpResponse | null = null;

export function getRegisterHtml(): string {
  return `
    <div class="demo-card">
      <div id="step-0">
        
        <h1>Registration Steps</h1>
        <ol class="register-steps">
          <li>Register on-chain</li>
          <li>Register on the app</li>
          <li>KYC</li>
          <li>Verify phone number</li>
        </ol>
        <div>Select your country of residence:</div>
            ${getSupportedCountriesHtml()}
       
       
        <h3><button id="init-register" class="button">Get started</button></h3>
        
      </div>
      <div id="step-1"  style="display: none;">
        <h1>Step-1/4: Register on-chain</h1>
        
        
        <div><button id="register" class="button">Register on-chain</button></div>
        
      </div>
      
      <div id="step-2" style="display: none;">
        <h2>Step-2/4: Register Email</h2>
        <p>Please provide your email to complete the registration process.</p>
        <form id="email-registration-form">
          <div>
            <label for="email">Email Address:</label>
            <input type="email" id="email" name="email" required placeholder="Enter your email">
          </div>
          <div style="margin-top: 15px;">
            <button type="submit" id="submit-email" class="button">Submit</button>
          </div>
        </form>
      </div>

      <div id="step-3" style="display: none;">
        <h2>Step-3/4: KYC</h2>
        <div>
          <p>Follow the link below to perform your KYC. After finishing your KYC, click Next.</p>
          <p>You will be able to go to next step only if your KYC is approved.</p>
          <p>Make sure you complete all steps in the KYC.</p>
        </div>
        <div id="kyc-link"></div>
        <div style="margin-top: 15px;">
          <button type="submit" id="kyc-submit" class="button">Next</button>
        </div>
      </div>


      <div id="step-4" style="display: none;">
        <h2>Step-4/4: Register your phone number</h2>
        <p>You're almost there! Please provide your phone number to complete the registration process.</p>
        <form id="phone-registration-form">
          <div>
            <label for="phone">Phone Number:</label>
            <input type="tel" id="phone" name="phone" required placeholder="Enter your phone number">
          </div>
          <div style="display: none;" id="otp">
            <label for="otp-input">Insert code sent to your phone number:</label>
            <input type="text" id="otp-input" name="otp-input" placeholder="Enter your phone confirmation code">
          </div>
          <div style="margin-top: 15px;">
            <button type="submit" id="submit-phone" class="button">Submit</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function addRegisterEvents() {
  const wallet = appState.getAddress();
  if (!wallet) {
    showToast({ message: "Couldn't detect your wallet address. Please connect your wallet.", type: "error" });
    return;
  }

  restoreLastRegisterAttempt();

  document.getElementById("init-register")?.addEventListener("click", () => {
    const step0 = document.getElementById("step-0");
    const step1 = document.getElementById("step-1");
    if (step0) step0.style.display = "none";
    if (step1) step1.style.display = "block";
  });

  document.getElementById("register")?.addEventListener("click", (event) => {
    const button = event.currentTarget as HTMLButtonElement;
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

    (async () => {
      const isSuccess = await registerOnApp();
      if (isSuccess) {
        await authenticate(wallet);
        updateStep2Ui();
      }
    })().catch(console.error);
  });

  document.getElementById("kyc-submit")?.addEventListener("click", (event) => {
    event.preventDefault();
    reauthenticate(wallet)
      .then(() => {
        const session = getSession();

        if (!session) {
          showToast({ message: "Authentication failed. Try again by refreshing this page.", type: "error" });
          return;
        }

        if (session.user.verification_status !== "Approved") {
          showToast({ message: "Please complete KYC before next step.", type: "error" });
          return;
        }

        updateStep3Ui();
      })
      .catch(console.error);
  });

  document.getElementById("phone-registration-form")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const session = getSession();
    if (!session) {
      showToast({ message: "Authentication failed. Try again by refreshing this page.", type: "error" });
      return;
    }

    const phoneNo = document.getElementById("phone") as HTMLInputElement;
    if (!phoneNo) {
      showToast({ message: `Phone number is required.`, type: "error" });
      return;
    }
    phoneNo.setAttribute("disabled", "true");

    const otpDiv = document.getElementById("otp");

    if (otpDiv) {
      otpDiv.style.display = "block";
    }

    (async () => {
      try {
        if (smsOtpResponse) {
          const codeInput = document.getElementById("otp-input") as HTMLInputElement;
          const verificationCode = codeInput.value;

          const verifyOtpResponse = await verifyOtp(verificationCode, session, smsOtpResponse).catch(console.error);

          if (verifyOtpResponse) {
            showToast({ message: "Your phone number has been verified. Your registration is complete.", type: "success" });
            const step4 = document.getElementById("step-4");
            if (step4) step4.style.display = "none";

            await reauthenticate(wallet);
          } else {
            showToast({ message: "Invalid verification code. ", type: "error" });
          }
        } else {
          smsOtpResponse = await registerPhone(phoneNo.value);
          showToast({ message: "An SMS has been sent to you.", type: "success" });
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
}

export function updateStep2Ui() {
  getKycLink().catch(console.error);
  const step2 = document.getElementById("step-2");
  const step3 = document.getElementById("step-3");
  if (step2) step2.style.display = "none";
  if (step3) step3.style.display = "block";
}

export function updateStep3Ui() {
  const step3 = document.getElementById("step-3");
  const step4 = document.getElementById("step-4");
  if (step3) step3.style.display = "none";
  if (step4) step4.style.display = "block";
}

function restoreLastRegisterAttempt() {
  const session = getSession();

  if (session?.user.residence_address.country) {
    const countryDropdown = document.getElementById("country-dropdown") as HTMLSelectElement;
    const country = session.user.residence_address.country;
    const option = Array.from(countryDropdown.options).find((opt) => {
      return opt.value === country;
    });

    if (option) {
      countryDropdown.value = option.value;
      countryDropdown.disabled = true;
    }
  }

  if (session?.user.email) {
    const emailInput = document.getElementById("email") as HTMLInputElement;
    emailInput.value = session.user.email;
    emailInput.disabled = true;
  }
}
