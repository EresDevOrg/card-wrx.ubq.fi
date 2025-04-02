import { getUserAuthToken } from "../../shared/user-auth";
import { getWirexApiUrl } from "../../shared/utils";
import { showToast } from "../toaster";

export interface SmsResponse {
  session_id: string;
  attempts_left: number;
  expires_at: string;
  code_length: number;
  resend_at: string;
}

export async function registerPhone(phone: string): Promise<SmsResponse> {
  const authToken = getUserAuthToken();
  const updatePhoneUrl = getWirexApiUrl("/api/v1/user/phone-number", authToken.isSandbox);
  const response = await fetch(updatePhoneUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${authToken.access_token}`,
      "X-User-Wallet": authToken.wallet,
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

  console.log("Phone confirmation code sent successfully");

  const smsUrl = getWirexApiUrl("/api/v1/confirmation/sms", authToken.isSandbox);
  const responseSms = await fetch(smsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${authToken.access_token}`,
      "X-User-Wallet": authToken.wallet,
    },
    body: JSON.stringify({
      action_type: "ConfirmPhone",
    }),
  });

  if (!responseSms.ok) {
    const errorData = await responseSms.json();
    showToast({ message: "Error sending confirmation sms. ", type: "error" });
    throw new Error(`Error sending confirmation sms ${JSON.stringify(errorData)}`);
  }

  const smsSendData = await responseSms.json();
  console.log("Phone confirmation code sent successfully:", smsSendData);
  return smsSendData;
}

export async function verifyPhone(smsResponse: SmsResponse) {
  const authToken = getUserAuthToken();
  const codeInput = document.getElementById("phone-confirmation-code") as HTMLInputElement;
  const verificationCode = codeInput.value;

  const smsVerifyUrl = getWirexApiUrl("/api/v1/confirmation/sms/verify", authToken.isSandbox);
  const responseVerify = await fetch(smsVerifyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${authToken.access_token}`,
      "X-User-Wallet": authToken.wallet,
    },
    body: JSON.stringify({
      code: verificationCode,
      session_id: smsResponse.session_id,
    }),
  });

  if (!responseVerify.ok) {
    const errorData = await responseVerify.json();
    console.error("Error verifying code", JSON.stringify(errorData));
    return false;
  }

  const smsVerifyData = await responseVerify.json();
  console.log("Phone number verified successfully:", smsVerifyData);

  return true;
}
