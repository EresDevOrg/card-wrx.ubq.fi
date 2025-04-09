import { getSession } from "../../shared/user-session";
import { getWirexApiUrl } from "../../shared/utils";
import { Card } from "../../shared/wirex-types";

export async function updateActiveBalance(cardId: string, tokenAddress: string): Promise<boolean> {
  const session = getSession();
  if (!session) {
    return false;
  }

  const apiUrl = getWirexApiUrl(`/api/v1/cards/${cardId}/balance/active`, session.isSandbox);

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        "X-User-Wallet": session.wallet,
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
  const session = getSession();
  if (!session) {
    return false;
  }

  const path = card.status === "Blocked" ? `/api/v1/cards/${card.id}/unblock` : `/api/v1/cards/${card.id}/block`;
  const cardStatusUrl = getWirexApiUrl(path, session.isSandbox);
  const responseToggleStatus = await fetch(cardStatusUrl, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.access_token}`,
      "X-User-Wallet": session.wallet,
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
  const session = getSession();
  if (!session) {
    return false;
  }

  const apiUrl = getWirexApiUrl(`/api/v1/cards/${cardId}/limit`, session.isSandbox);

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        "X-User-Wallet": session.wallet,
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
