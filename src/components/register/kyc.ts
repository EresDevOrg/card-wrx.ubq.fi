import { backendBaseUrl } from "../../constants";
import { appState } from "../../main";

export async function getKycLink(): Promise<void> {
  const response = await fetch(`${backendBaseUrl}/kyc-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      wallet: appState.getAddress(),
    }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log("kyc link response data", data);
    const step3 = document.getElementById("step-3");
    const element = document.createElement("a");
    element.href = data.redirect_uri;
    element.innerText = data.redirect_uri;
    element.target = "_blank";
    if (step3) {
      step3.appendChild(element);
      step3.style.display = "block";
    }
  }

  throw new Error(`Error getting kyc link: ${data}`);
}
