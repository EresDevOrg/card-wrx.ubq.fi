import { addCardSettingsEvents, getCardSettingsHtml } from "../components/card-settings/card-settings";
import { appState } from "../main";

export async function loadCardSettingsPage() {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      if (appState.getIsConnectedState()) {
        const content = getCardSettingsHtml();
        contentArea.innerHTML = content;
        addCardSettingsEvents();
      } else {
        contentArea.innerHTML = `<div class="connect-request">Connect your wallet to use this page.</div>`;
      }
    } catch (error) {
      console.error("Failed to load cards page:", error);
    }
  }
}
