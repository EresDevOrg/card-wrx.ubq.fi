import { addCardSettingsEvents, getCardSettingsHtml } from "../components/card-settings";
import { showToast } from "../components/toaster";
import { appState } from "../main";

export async function loadCardSettingsPage(cardId: string) {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      if (appState.getIsConnectedState()) {
        const content = getCardSettingsHtml(cardId);
        contentArea.innerHTML = content;
        addCardSettingsEvents(cardId);
      } else {
        showToast({ message: "Connect your wallet to use this page.", type: "error" });
      }
    } catch (error) {
      console.error("Failed to load cards page:", error);
    }
  }
}
