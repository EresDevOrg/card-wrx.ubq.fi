import { getUserAuthToken2 } from "../../shared/user-auth";
import { getWirexApiUrl } from "../../shared/utils";
import { Card } from "../../shared/wirex-types";

export async function updateActiveBalance(cardId: string, tokenAddress: string): Promise<boolean> {
  const auth = getUserAuthToken2();
  if (!auth) {
    return false;
  }

  const apiUrl = getWirexApiUrl(`/api/v1/cards/${cardId}/balance/active`, auth.isSandbox);

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.access_token}`,
        "X-User-Wallet": auth.wallet,
      },
      body: JSON.stringify({
        balance_token_address: tokenAddress,
      }),
    });

    if (response.ok) {
      return true;
    } else {
      const errorData = await response.json();
      console.error("Error updating active balance:", JSON.stringify(errorData));
      return false;
    }
  } catch (error) {
    console.error("Error updating active balance:", error);
    return false;
  }
}

export async function toggleStatus(card: Card): Promise<boolean> {
  const auth = getUserAuthToken2();
  if (!auth) {
    return false;
  }

  const path = card.status === "Blocked" ? `/api/v1/cards/${card.id}/unblock` : `/api/v1/cards/${card.id}/block`;
  const cardStatusUrl = getWirexApiUrl(path, auth.isSandbox);
  const responseToggleStatus = await fetch(cardStatusUrl, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${auth.access_token}`,
      "X-User-Wallet": auth.wallet,
    },
  });

  if (responseToggleStatus.ok) {
    return true;
  }

  const errorData = await responseToggleStatus.json();
  console.error("Error in status toggle", JSON.stringify(errorData));
  return false;
}

export async function updateCardLimit(cardId: string, limit: number): Promise<boolean> {
  const auth = getUserAuthToken2();
  if (!auth) {
    return false;
  }

  const apiUrl = getWirexApiUrl(`/api/v1/cards/${cardId}/limit`, auth.isSandbox);

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.access_token}`,
        "X-User-Wallet": auth.wallet,
      },
      body: JSON.stringify({
        limit: limit,
      }),
    });

    if (response.ok) {
      return true;
    } else {
      const errorData = await response.json();
      console.error("Error updating card limit:", JSON.stringify(errorData));
      return false;
    }
  } catch (error) {
    console.error("Error updating card limit:", error);
    return false;
  }
}
