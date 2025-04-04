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
    const kycLink = document.getElementById("kyc-link");
    const element = document.createElement("a");
    element.href = data.redirect_uri;
    element.innerText = data.redirect_uri;
    element.target = "_blank";
    if (kycLink) {
      kycLink.appendChild(element);
      kycLink.style.display = "block";
    }
  }

  throw new Error(`Error getting kyc link: ${data}`);
}
