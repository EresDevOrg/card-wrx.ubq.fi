import { handleRegisterEvents, register } from "../components/register/main";

export async function loadRegisterPage() {
  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    try {
      const content = register();
      contentArea.innerHTML = content;
      handleRegisterEvents();
    } catch (error) {
      console.error("Failed to load page:", error);
    }
  }
}
