import { backendBaseUrl } from "../constants";
import { UserAuthToken } from "./types";
import { getWirexApiUrl } from "./utils";

export async function authenticateUser(wallet: string): Promise<void> {
  const responseAuth = await fetch(`${backendBaseUrl}/user-auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      wallet: wallet,
    }),
  });

  const auth: UserAuthToken = { wallet: wallet, ...(await responseAuth.json()) };

  console.log("user-auth response data", auth);

  if (responseAuth.ok) {
    const cardsUrl = `${getWirexApiUrl("/api/v1/cards?page_number=0&page_size=10", auth.isSandbox)}`;
    const cardsResponse = await fetch(cardsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
        Accept: "application/json",
        "X-User-Wallet": auth.wallet,
      },
    });

    const cards = await cardsResponse.json();
    console.log("cards", cards);
    if (cards.data.length > 0) {
      auth.card = cards.data[0]; // per specs, deal with only one card for now
    }
    localStorage.setItem("user-auth", JSON.stringify(auth));
  }
}

/**
 * @throws {Error} if user is not authenticated
 * @returns UserAuthToken
 */
export function getUserAuthToken(): UserAuthToken {
  const userAuth = localStorage.getItem("user-auth");
  if (!userAuth) throw new Error("User is not authenticated");

  const userAuthJson: UserAuthToken = JSON.parse(userAuth);

  return userAuthJson;
}

export function getUserAuthToken2(): UserAuthToken | null {
  const userAuth = localStorage.getItem("user-auth");
  if (!userAuth) return null;

  const userAuthJson: UserAuthToken = JSON.parse(userAuth);

  return userAuthJson;
}

export function clearUserAuthToken() {
  localStorage.removeItem("user-auth");
}
