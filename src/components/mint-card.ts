import { getSession } from "../shared/user-session";
import { getCardImage } from "./card-svg";
import { showToast } from "./toaster";
import { showPopup } from "./popup";
import { createWirexApiUrl } from "../../functions/shared";

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
      const session = getSession();
      if (!session) {
        showToast({ message: "You must register before you can mint a card.", type: "error" });
        return;
      }

      const shouldMint = await showPopup({
        title: "Mint New Card?",
        message: "Are you sure you want to mint a new card?",
        shouldShowCancelButton: true,
        confirmText: "Yes",
        cancelText: "No",
      });

      if (shouldMint !== true) {
        showToast({ message: "Minting cancelled", type: "info" });
        return;
      }

      try {
        const user = session.user;

        if (user.verification_status !== "Approved") {
          showToast({
            message: "You are not verified. Please complete your KYC before minting a card.",
            type: "error",
          });
          return;
        }

        if (user.user_status !== "Active") {
          showToast({
            message: "Your account is not active to mint a card.",
            type: "error",
          });
          return;
        }

        const cardsUrl = `${createWirexApiUrl("api/v1/cards?page_number=0&page_size=10", session.isSandbox)}`;
        const cardsResponse = await fetch(cardsUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            Accept: "application/json",
            "X-User-Wallet": session.wallet,
          },
        });

        const cards = await cardsResponse.json();
        console.log("cards", cards);
        // In case we want to limit the number of cards
        // if (cards.data.length > 1) {
        //   showToast({ message: `You already have a card. You cannot mint more for now.`, type: "error" });
        //   return;
        // }

        const mintUrl = `${createWirexApiUrl("api/v1/cards/virtual", session.isSandbox)}`;
        const cardResponse = await fetch(mintUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            Accept: "application/json",
            "X-User-Wallet": session.wallet,
          },
        });

        if (!cardResponse.ok) {
          throw new Error("Failed to mint card");
        }

        const card = await cardResponse.json();
        showToast({ message: `Card minted successfully! It will be available on the cards page in a few minutes.`, type: "success" });
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
