import { backendBaseUrl } from "../constants";
import { UserAuthToken } from "./types";

export async function authenticateUser(wallet: string): Promise<void> {
  const response = await fetch(`${backendBaseUrl}/user-auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      wallet: wallet,
    }),
  });

  const data: UserAuthToken = { wallet: wallet, ...(await response.json()) };
  console.log("user-auth response data", data);

  if (response.ok) {
    localStorage.setItem("user-auth", JSON.stringify(data));
  }
}

export function getUserAuthToken(): UserAuthToken {
  const userAuth = localStorage.getItem("user-auth");
  if (!userAuth) throw new Error("User is not authenticated");

  const userAuthJson: UserAuthToken = JSON.parse(userAuth);

  return userAuthJson;
}

export function clearUserAuthToken() {
  localStorage.removeItem("user-auth");
}
