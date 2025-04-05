import { addCardsEvents, getCardsHtml } from "../components/cards";
import { showToast } from "../components/toaster";
import { appState } from "../main";

export async function loadCardsPage() {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      if (appState.getIsConnectedState()) {
        const content = getCardsHtml();
        contentArea.innerHTML = content;
        addCardsEvents();
      } else {
        showToast({ message: "Connect your wallet to use this page.", type: "error" });
      }
    } catch (error) {
      console.error("Failed to load cards page:", error);
    }
  }
}
