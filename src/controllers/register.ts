import { addRegisterEvents, getRegisterHtml } from "../components/register/register";
import { appState } from "../main";

export async function loadRegisterPage() {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      if (appState.getIsConnectedState()) {
        const content = getRegisterHtml();
        contentArea.innerHTML = content;
        addRegisterEvents();
      } else {
        throw new Error("Connect your wallet to use this page.");
      }
    } catch (error) {
      console.error("Failed to load page:", error);
    }
  }
}
