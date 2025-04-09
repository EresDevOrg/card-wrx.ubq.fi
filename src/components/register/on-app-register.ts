import { ethers } from "ethers";
import { backendBaseUrl } from "../../constants";
import { showToast } from "../toaster";
import { getSession } from "../../shared/user-session";

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

  // Get user's wallet address
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    // Get sandbox status
    const backendBaseUrl = "";
    const authUrl = `${backendBaseUrl}/auth`;
    await fetch(authUrl, { method: "GET" });

    // Register user with API
    const isSuccess = await registerUserWithApi(email, userAddress);

    return isSuccess;
  } else {
    alert("Please install a Web3 wallet like MetaMask to continue.");
  }
}

async function registerUserWithApi(email: string, userAddress: string): Promise<boolean> {
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
        country: "DE", // Add any other required fields based on the API documentation
        // Add any other required fields based on the API documentation
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.message || response.statusText}`);
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
