import { createHomePage } from "../components/home";
import { handleNewUserEvents, newUser } from "../components/new-user";
import { appState } from "../main";

export async function loadHomePage() {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      if (appState.getIsConnectedState()) {
        const content = newUser();
        contentArea.innerHTML = content;
        handleNewUserEvents();
      } else {
        const content = createHomePage();
        contentArea.innerHTML = content;
      }
    } catch (error) {
      console.error("Failed to load home page:", error);
    }
  }
}
