import { addHomeEvents, createHomePage } from "../components/home";
import { getUserAuthToken } from "../shared/user-auth";

export async function loadHomePage() {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      const auth = getUserAuthToken();
      if (!auth.card) {
        window.location.hash = "/mint";
      } else {
        window.location.hash = "/dashboard";
      }
    } catch (error) {
      const content = createHomePage();
      contentArea.innerHTML = content;
      addHomeEvents();
      console.error("Failed to load home page:", error);
    }
  }
}
