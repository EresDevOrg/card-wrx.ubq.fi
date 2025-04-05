import { addCardsEvents, getCardsHtml } from "../components/cards";

export async function loadCardsPage() {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      const content = getCardsHtml();
      contentArea.innerHTML = content;
      addCardsEvents();
    } catch (error) {
      console.error("Failed to load cards page:", error);
    }
  }
}
