import { ethers } from "ethers";
import { userSigner } from "../main";
import { WIREX_API_URL_PRODUCTION, WIREX_API_URL_SANDBOX } from "../../functions/shared";

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

export async function verify(message: string, signature: string, wallet: string): Promise<boolean> {
  return ethers.utils.verifyMessage(message, signature) == wallet;
}

export function getWirexApiUrl(path: string, sandbox: boolean): string {
  if (sandbox) {
    return `${WIREX_API_URL_SANDBOX}${path}`;
  }

  return `${WIREX_API_URL_PRODUCTION}${path}`;
}
