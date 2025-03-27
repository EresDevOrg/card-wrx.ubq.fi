import { backendBaseUrl } from "../constants";

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

  const data = await response.json();
  console.log("user-auth response data", data);

  if (response.ok) {
    localStorage.setItem("user-auth", JSON.stringify(data));
  }
}

export function getUserAuthToken(): string | null {
  const userAuth = localStorage.getItem("user-auth");
  if (!userAuth) return null;

  const userAuthJson = JSON.parse(userAuth);

  return userAuthJson.access_token;
}
