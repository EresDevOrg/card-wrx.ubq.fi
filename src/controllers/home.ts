import { createHomePage } from "../components/home";
import { handleRegisterEvents, register } from "../components/register/main";

import { appState } from "../main";

export async function loadHomePage() {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      if (appState.getIsConnectedState()) {
        const content = register();
        contentArea.innerHTML = content;
        handleRegisterEvents();
      } else {
        const content = createHomePage();
        contentArea.innerHTML = content;
      }
    } catch (error) {
      console.error("Failed to load home page:", error);
    }
  }
}
