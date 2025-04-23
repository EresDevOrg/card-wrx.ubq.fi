import { addRegisterEvents, getRegisterHtml } from "../components/register/register";
import { appState } from "../main";

export async function loadRegisterPage() {
  const contentArea = document.getElementById("content-area");
  if (!contentArea) return;

  try {
    if (appState.getIsConnectedState()) {
      const content = getRegisterHtml();
      contentArea.innerHTML = content;
      addRegisterEvents();
    } else {
      contentArea.innerHTML = `<div class="connect-request">Connect your wallet to use this page.</div>`;
    }
  } catch (error) {
    console.error("Failed to load page:", error);
  }
}
