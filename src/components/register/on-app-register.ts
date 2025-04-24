import { backendBaseUrl } from "../../constants";
import { appState } from "../../main";
import { getSession } from "../../shared/user-session";
import { sign } from "../../shared/utils";
import { showToast } from "../toaster";

export async function registerOnApp() {
  const session = getSession();
  if (session?.user.email) {
    return true; // already registered
  }

  const emailInput = document.getElementById("email") as HTMLInputElement;
  const email = emailInput.value.trim();

  if (!email) {
    showToast({ message: "Please enter a valid email.", type: "error" });
    return false;
  }

  if (!window.ethereum) {
    showToast({ message: "Please install a Web3 wallet like MetaMask to continue.", type: "error" });
    return false;
  }

  const userAddress = appState.getAddress();
  if (!userAddress) {
    showToast({ message: "Please connect your wallet.", type: "error" });
    return false;
  }

  let signature;
  try {
    signature = await sign(`Authentication request for ${userAddress.toLowerCase()}`);
  } catch (e) {
    showToast({
      message: "Signature is required to register.",
      type: "error",
    });
    console.error("Error signing message: ", e);
    return false;
  }

  // read country from select dropdown with id country-dropdown
  const countryDropdown = document.getElementById("country-dropdown") as HTMLSelectElement;
  const country = countryDropdown.value;
  if (!country) {
    showToast({ message: "We couldn't detect your country. Try to restart the register process.", type: "error" });
    return false;
  }

  // Register user with API
  const isSuccess = await registerUserWithApi(email, userAddress, country, signature);

  return isSuccess;
}

async function registerUserWithApi(email: string, userAddress: string, country: string, signature: string): Promise<boolean> {
  try {
    const response = await fetch(`${backendBaseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email,
        wallet_address: userAddress,
        signature: signature,
        country: country,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("API registration successful:", data);
    return true;
  } catch (error) {
    console.error("Error registering with API:", error);
    alert(`Error registering with API: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}
