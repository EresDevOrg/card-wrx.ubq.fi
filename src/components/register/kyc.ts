import { createWirexApiUrl } from "../../../functions/shared";
import { appState } from "../../main";
import { getSession } from "../../shared/user-session";
import { showToast } from "../toaster";

export async function getKycLink(): Promise<void> {
  const session = getSession();
  if (!session?.access_token) {
    showToast({ message: "Authentication failed. Try again by refreshing this page.", type: "error" });
    return;
  }

  const wallet = appState.getAddress();
  if (!wallet) {
    showToast({ message: "Couldn't detect your wallet address. Please connect your wallet.", type: "error" });
    return;
  }

  const kycLinkUrl = createWirexApiUrl("api/v1/user/verification-link", session.isSandbox);

  const response = await fetch(kycLinkUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${session.access_token}`,
      "X-User-Wallet": wallet,
    },
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
