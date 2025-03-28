import { createHomePage } from "../components/home";
import { handleMintCardEvents, mintCard } from "../components/mint-card/main";
import { handleRegisterEvents, register } from "../components/register/main";

import { appState } from "../main";
import { getUserAuthToken } from "../shared/user-auth";

export async function loadHomePage() {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      const auth = getUserAuthToken();
      if (auth) {
        const content = mintCard();
        contentArea.innerHTML = content;
        handleMintCardEvents();
      } else if (appState.getIsConnectedState()) {
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
