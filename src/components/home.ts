import { appState } from "../main";
import { getCardImage } from "./card-svg";
import { showToast } from "./toaster";

export function createHomePage(): string {
  return `
     <div class="demo-card">
      <div>
        ${getCardImage()}  
        <h4>Seamless. Secure. Ubiquitous.</h4>
        <h2><a href="#/register" id="proceed-to-register">Register to get your UbiquiCard</a></h2>
      </div>
    </div>
  `;
}

export function addHomeEvents() {
  const proceedToRegister = document.getElementById("proceed-to-register");

  if (proceedToRegister) {
    proceedToRegister.addEventListener("click", (event) => {
      if (!appState.getIsConnectedState()) {
        event.preventDefault();
        showToast({ message: "Please connect your wallet first.", type: "error" });
      }
    });
  }
}
