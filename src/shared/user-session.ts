import { createWirexApiUrl } from "../../functions/shared";
import { showToast } from "../components/toaster";
import { backendBaseUrl } from "../constants";
import { Session } from "./types";
import { sign } from "./utils";
import { Card } from "./wirex-types";

export async function authenticate(wallet: string): Promise<void> {
  const session = getSession();
  const hasTokenExpired = session?.expires_at && new Date(session.expires_at * 1000) < new Date();

  if (!session || hasTokenExpired) {
    await reauthenticate(wallet);
  }
}

export async function reauthenticate(wallet: string): Promise<void> {
  const signature = await getSignature(wallet);
  if (!signature) {
    showToast({
      message: "Signature is required to use the app.",
      type: "error",
    });
    return;
  }

  const responseAuth = await fetch(`${backendBaseUrl}/user-auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      wallet: wallet,
      signature: signature,
    }),
  });

  const session: Session = { wallet: wallet, ...(await responseAuth.json()) };

  console.log("Session: ", session);

  localStorage.setItem("session", JSON.stringify(session));
}

export function getSession(): Session | null {
  const sessionRaw = localStorage.getItem("session");
  if (!sessionRaw) return null;

  const session: Session = JSON.parse(sessionRaw);

  return session;
}

export function clearSession() {
  localStorage.removeItem("session");
  localStorage.removeItem("user-signature");
  localStorage.removeItem("user-cards");
}

export async function getSignature(wallet: string): Promise<string | null> {
  let signature = localStorage.getItem("user-signature");

  if (!signature) {
    try {
      signature = await sign(`Authentication request for ${wallet.toLowerCase()}`);
      localStorage.setItem("user-signature", signature);
    } catch (e) {
      console.error("Error signing message: ", e);
      return null;
    }
  }

  return signature;
}

async function loadCards(): Promise<Card[] | null> {
  const session = getSession();
  if (!session) {
    console.error("Session not found");
    return null;
  }

  const cardsUrl = `${createWirexApiUrl("api/v1/cards?page_number=0&page_size=10", session.isSandbox)}`;
  const cardsResponse = await fetch(cardsUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      Accept: "application/json",
      "X-User-Wallet": session.wallet,
    },
  });

  const cards = await cardsResponse.json();
  console.log("cards", cards);
  if (cards.data) {
    return cards.data;
  }

  return null;
}

export async function getUserCards(): Promise<Card[]> {
  const userCardsRaw = localStorage.getItem("user-cards");
  if (userCardsRaw) {
    return JSON.parse(userCardsRaw);
  }

  const cards = await loadCards();
  if (cards) {
    localStorage.setItem("user-cards", JSON.stringify(cards));
    return cards;
  }

  return [];
}

export async function updateCardsStorage() {
  const cards = await loadCards();
  localStorage.setItem("user-cards", JSON.stringify(cards));
}
