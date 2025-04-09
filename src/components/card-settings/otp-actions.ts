import { getSession } from "../../shared/user-session";
import { Session } from "../../shared/types";
import { getWirexApiUrl, sendOtpForAction, verifyOtp } from "../../shared/utils";
import { Card } from "../../shared/wirex-types";
import { showPopup } from "../popup";
import { showToast } from "../toaster";

export async function getCardNumbers(cardId: string, actionToken: string, auth: Session) {
  const response = await fetch(getWirexApiUrl(`/api/v1/cards/${cardId}/details`, auth.isSandbox), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${auth.access_token}`,
      "X-User-Wallet": auth.wallet,
    },
    body: JSON.stringify({
      action_token: actionToken,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error fetching card numbers:", JSON.stringify(errorData));
    return null;
  }

  const data: {
    card_number: string;
    expiry_date: string;
  } = await response.json();
  console.log("Card numbers retrieved successfully:", data);

  return data.card_number;
}

export async function executeWithOtp(
  callback: (cardId: string, actionToken: string, auth: Session) => Promise<string | null>,
  element: HTMLElement,
  card: Card
) {
  const session = getSession();
  if (!session) {
    return false;
  }
  const smsSendData = await sendOtpForAction(session, "GetCardDetails");
  if (smsSendData) {
    await showPopup({
      title: "Confirm OTP",
      message: "Please enter the OTP sent to your phone number.",
      shouldShowCancelButton: true,
      onConfirm: async (otp) => {
        if (otp) {
          const smsVerifyData: { token: string } = await verifyOtp(otp, session, smsSendData);
          if (!smsVerifyData) {
            showToast({ message: "Failed to verify OTP.", type: "error" });
            return;
          }

          const text = await callback(card.id, smsVerifyData.token, session);

          if (text) {
            element.textContent = text;
          }
        }
      },
      isPrompt: true,
      inputPlaceholder: "Enter OTP",
    });
  }
}

export async function getCvvCode(cardId: string, actionToken: string, auth: Session) {
  const response = await fetch(getWirexApiUrl(`/api/v1/cards/${cardId}/cvv`, auth.isSandbox), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${auth.access_token}`,
      "X-User-Wallet": auth.wallet,
    },
    body: JSON.stringify({
      action_token: actionToken,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error fetching cvv:", JSON.stringify(errorData));
    return null;
  }

  const data: { cvv: string } = await response.json();
  console.log("CVV retrieved successfully:", data);

  return data.cvv;
}
