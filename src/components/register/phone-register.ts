import { createWirexApiUrl } from "../../../functions/shared";
import { getSession } from "../../shared/user-session";
import { getConnectedChainId, sendOtpForAction } from "../../shared/utils";
import { SmsOtpResponse, VerifyOtpResponse } from "../../shared/wirex-types";
import { showToast } from "../toaster";

export async function registerPhone(phone: string): Promise<SmsOtpResponse> {
  const session = getSession();
  if (!session) {
    showToast({ message: "Authentication failed. Try again by refreshing this page.", type: "error" });
    throw new Error("Authentication failed");
  }
  const updatePhoneUrl = createWirexApiUrl("api/v1/user/phone-number", session.isSandbox);
  const response = await fetch(updatePhoneUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${session.access_token}`,
      "X-User-Wallet": session.wallet,
      "X-Chain-Id": getConnectedChainId(),
    },
    body: JSON.stringify({
      phone_number: phone,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    showToast({ message: "Error updating phone number. ", type: "error" });
    throw new Error(`Error updating phone number: ${JSON.stringify(errorData)}`);
  }

  const smsOtpResponse = await sendOtpForAction(session, "VerifyPhone");
  if (!smsOtpResponse) {
    throw new Error("Error sending OTP SMS");
  }

  return smsOtpResponse;
}

export async function confirmPhoneRegister(verifyOtpResponse: VerifyOtpResponse) {
  const session = getSession();
  if (!session) {
    showToast({ message: "Authentication failed. Try again by refreshing this page.", type: "error" });
    throw new Error("Authentication failed");
  }
  const updatePhoneUrl = createWirexApiUrl("api/v1/user/phone-number/confirm", session.isSandbox);
  const response = await fetch(updatePhoneUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${session.access_token}`,
      "X-User-Wallet": session.wallet,
      "X-Chain-Id": getConnectedChainId(),
    },
    body: JSON.stringify({
      action_token: verifyOtpResponse.token,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    showToast({ message: "Error updating phone number. ", type: "error" });
    throw new Error(`Error updating phone number: ${JSON.stringify(errorData)}`);
  }
}
