import { addTransactionsEvents, getTransactionsHtml } from "../components/transaction-history";
import { appState } from "../main";

export async function loadTransactionsPage() {
  const contentArea = document.getElementById("content-area");
  if (!contentArea) return;

  try {
    if (appState.getIsConnectedState()) {
      const content = getTransactionsHtml();
      contentArea.innerHTML = content;
      addTransactionsEvents();
    } else {
      contentArea.innerHTML = `<div class="connect-request">Connect your wallet to use this page.</div>`;
    }
  } catch (error) {
    console.error("Failed to load transaction history page:", error);
  }
}
