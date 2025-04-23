import { addHomeEvents, createHomePage } from "../components/home";

export async function loadHomePage() {
  const contentArea = document.getElementById("content-area");
  if (!contentArea) return;

  try {
    const content = createHomePage();
    contentArea.innerHTML = content;
    addHomeEvents();
  } catch (error) {
    console.error("Failed to load home page:", error);
  }
}
