import { createWirexApiUrl } from "../../functions/shared";
import { SmsOtpResponse } from "../components/register/phone-register";
import { showToast } from "../components/toaster";
import { userSigner } from "../main";
import { Session } from "./types";

export async function sign(message: string): Promise<string> {
  try {
    if (userSigner) {
      // Sign the message using Ethers signer
      // Ethers automatically adds the "\x19Ethereum Signed Message:\n" prefix
      const signature = await userSigner.signMessage(message);

      return signature;
    } else {
      throw new Error("Signer not defined.");
    }
  } catch (error) {
    console.error("Error signing message:", error);
    throw new Error(`Failed to sign message: ${error}`);
  }
}

export async function sendOtpForAction(session: Session, action: "GetCardDetails" | "ConfirmPhone"): Promise<SmsOtpResponse | null> {
  const smsUrl = createWirexApiUrl("api/v1/confirmation/sms", session.isSandbox);
  const responseSms = await fetch(smsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${session.access_token}`,
      "X-User-Wallet": session.wallet,
    },
    body: JSON.stringify({
      action_type: action,
    }),
  });

  if (!responseSms.ok) {
    const errorData = await responseSms.json();
    showToast({ message: "Error sending OTP SMS. ", type: "error" });
    console.log(`Error sending confirmation sms ${JSON.stringify(errorData)}`);
    return null;
  }

  const smsOtpResponse = await responseSms.json();
  console.log("Phone confirmation code sent successfully:", smsOtpResponse);
  return smsOtpResponse;
}

export async function verifyOtp(otp: string, session: Session, smsResponse: SmsOtpResponse) {
  const smsVerifyUrl = createWirexApiUrl("api/v1/confirmation/sms/verify", session.isSandbox);
  const responseVerify = await fetch(smsVerifyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${session.access_token}`,
      "X-User-Wallet": session.wallet,
    },
    body: JSON.stringify({
      code: otp,
      session_id: smsResponse.session_id,
    }),
  });

  if (!responseVerify.ok) {
    const errorData = await responseVerify.json();
    console.error("Error verifying code", JSON.stringify(errorData));
    return null;
  }

  const smsVerifyData = await responseVerify.json();
  console.log("Phone number verified successfully:", smsVerifyData);

  return smsVerifyData;
}
