import { addMintCardEvents, mintCard } from "../components/mint-card";
import { showToast } from "../components/toaster";
import { appState } from "../main";

export async function loadMintPage() {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      if (appState.getIsConnectedState()) {
        const content = mintCard();
        contentArea.innerHTML = content;
        addMintCardEvents();
      } else {
        showToast({ message: "Connect your wallet to use this page.", type: "error" });
      }
    } catch (error) {
      console.error("Failed to load cards page:", error);
    }
  }
}
