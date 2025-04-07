import { getUserAuthToken } from "../../shared/user-auth";
import { getWirexApiUrl } from "../../shared/utils";
import { getCardImage } from "../card-svg";
import { showToast } from "../toaster";

export function mintCard(): string {
  return `
    <div class="demo-card">
        ${getCardImage()}       
        <h2><a href="javascript:;" id="mint-card">Mint your UbiquiCard</a></h2>
      </div>
    `;
}

export function addMintCardEvents() {
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

        const cardsUrl = `${getWirexApiUrl("/api/v1/cards?page_number=0&page_size=10", authToken.isSandbox)}`;
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
        // if (cards.data.length > 1) {
        //   showToast({ message: `You already have a card. You cannot mint more for now.`, type: "error" });
        //   return;
        // }

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
