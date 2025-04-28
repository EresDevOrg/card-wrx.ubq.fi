import { createWirexApiUrl } from "../../../functions/shared";
import { getSession } from "../../shared/user-session";
import { sendOtpForAction } from "../../shared/utils";
import { SmsOtpResponse } from "../../shared/wirex-types";
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
