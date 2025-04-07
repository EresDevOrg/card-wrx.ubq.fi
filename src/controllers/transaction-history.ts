import { addTransactionsEvents, getTransactionsHtml } from "../components/transaction-history";

export async function loadTransactionsPage() {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      const content = getTransactionsHtml();
      contentArea.innerHTML = content;
      addTransactionsEvents();
    } catch (error) {
      console.error("Failed to load transaction history page:", error);
    }
  }
}
