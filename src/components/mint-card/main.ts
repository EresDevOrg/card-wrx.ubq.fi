import { getUserAuthToken } from "../../shared/user-auth";
import { getWirexApiUrl } from "../../shared/utils";
import { showToast } from "../toaster";

export function mintCard(): string {
  return `
    <div class="demo-card">
  
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
       
        <h2><a href="javascript:;" id="mint-card">Mint your UbiquiCard</a></h2>
       
      </div>
    `;
}

export function handleMintCardEvents() {
  document.getElementById("mint-card")?.addEventListener("click", () => {
    (async () => {
      const authToken = getUserAuthToken();

      try {
        const user = authToken.user;
        // Check verification status (assuming the response structure matches the original logic)
        // // Change it to Approved later
        if (user.verification_status !== "Approved") {
          showToast({
            message: "You are not verified. Please complete your KYC before minting a card.",
            type: "error",
          });
          return;
        }

        // Check user status
        if (user.user_status !== "Active") {
          showToast({
            message: "Your account is not active to mint a card.",
            type: "error",
          });
          return;
        }

        const cardsUrl = `${getWirexApiUrl("/api/v1/cards?page_number=1&page_size=10", authToken.isSandbox)}`;
        const cardsResponse = await fetch(cardsUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken.access_token}`,
            Accept: "application/json",
            "X-User-Wallet": authToken.wallet,
          },
        });

        const cards = await cardsResponse.json();
        console.log("cards", cards);
        if (cards.data.length > 1) {
          showToast({ message: `You already have a card. You cannot mint more for now.`, type: "error" });
          return;
        }

        const mintUrl = `${getWirexApiUrl("/api/v1/cards/virtual", authToken.isSandbox)}`;
        const cardResponse = await fetch(mintUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken.access_token}`,
            Accept: "application/json",
            "X-User-Wallet": authToken.wallet,
          },
        });

        if (!cardResponse.ok) {
          throw new Error("Failed to mint card");
        }

        const card = await cardResponse.json();
        showToast({ message: `Card minted successfully! Card ID: ${card.id}`, type: "success" });
        console.log("card", card);
      } catch (error) {
        console.error("Error:", error);
        showToast({
          message: "An error occurred while minting your card.",
          type: "error",
        });
      }
    })().catch(console.error);
  });
}

// export function updateStep1Ui() {
//   const step1 = document.getElementById("step-1");
//   const step2 = document.getElementById("step-2");
//   if (step1) step1.style.display = "none";
//   if (step2) step2.style.display = "block";
//   currentStep = RegistrationStep.ON_CHAIN_REGISTERED;
// }

// export function updateStep2Ui() {
//   getKycLink().catch(console.error);
//   const step2 = document.getElementById("step-2");
//   const step3 = document.getElementById("step-3");
//   if (step2) step2.style.display = "none";
//   if (step3) step3.style.display = "block";
//   currentStep = RegistrationStep.API_REGISTERED;
// }
