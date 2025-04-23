import { addMintCardEvents, mintCard } from "../components/mint-card";
import { appState } from "../main";

export async function loadMintPage() {
  const contentArea = document.getElementById("content-area");
  if (!contentArea) return;

  try {
    if (appState.getIsConnectedState()) {
      const content = mintCard();
      contentArea.innerHTML = content;
      addMintCardEvents();
    } else {
      contentArea.innerHTML = `<div class="connect-request">Connect your wallet to use this page.</div>`;
    }
  } catch (error) {
    console.error("Failed to load cards page:", error);
  }
}
