import { addCardsEvents, getCardsHtml } from "../components/cards";
import { appState } from "../main";

export async function loadCardsPage() {
  const contentArea = document.getElementById("content-area");
  if (!contentArea) return;

  try {
    if (appState.getIsConnectedState()) {
      const content = getCardsHtml();
      contentArea.innerHTML = content;
      addCardsEvents();
    } else {
      contentArea.innerHTML = `<div class="connect-request">Connect your wallet to use this page.</div>`;
    }
  } catch (error) {
    console.error("Failed to load cards page:", error);
  }
}
