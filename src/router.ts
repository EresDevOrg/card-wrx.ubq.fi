import { loadCardsPage } from "./controllers/cards";
import { loadPage2 } from "./controllers/page2";
import { redirectTo404 } from "./controllers/404";
import { loadHomePage } from "./controllers/home";
import { loadRegisterPage } from "./controllers/register";
import { loadCardSettingsPage } from "./controllers/card-settings";

// URL Path based routing
export async function handleRouting() {
  const contentArea = document.getElementById("content-area");

  if (!contentArea) return;

  // Normalize route to handle default case
  const route = window.location.hash || "#/home";
  let cardId;

  switch (
    true // Switch on 'true' to allow for more complex conditions
  ) {
    case route === "#/home" || route === "#/index":
      await loadHomePage();
      break;
    case route === "#/register":
      await loadRegisterPage();
      break;
    case route === "#/page2":
      await loadPage2();
      break;
    case route === "#/cards":
      await loadCardsPage(); // Optionally load a general cards overview page
      break;
    case route.startsWith("#/cards/"):
      cardId = route.substring("#/cards/".length);
      await loadCardSettingsPage(cardId); // Call a new function to load the specific card's details
      break;
    default:
      // Redirect to 404 page if no route matches
      await redirectTo404();
      break;
  }
}

export function setupRouter() {
  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", () => {
      handleRouting().catch(console.error);
    });

    handleRouting().catch(console.error);
  }
}
