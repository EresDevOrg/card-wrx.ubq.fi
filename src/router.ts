import { redirectTo404 } from "./controllers/404";
import { loadCardSettingsPage } from "./controllers/card-settings";
import { loadCardsPage } from "./controllers/cards";
import { loadHomePage } from "./controllers/home";
import { loadMintPage } from "./controllers/mint-card";
import { loadPage2 } from "./controllers/page2";
import { loadRegisterPage } from "./controllers/register";
import { loadTransactionsPage } from "./controllers/transaction-history";

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
    case route === "#/mint":
      await loadMintPage();
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
    case route === "#/transactions":
      await loadTransactionsPage(); // Optionally load a general cards overview page
      break;
    default:
      // Redirect to 404 page if no route matches
      await redirectTo404();
      break;
  }
}
