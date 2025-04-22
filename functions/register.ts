import { ethers } from "ethers";
import { getAccessToken } from "./shared";
import { Context } from "./types";

export async function onRequestPost(ctx: Context): Promise<Response> {
  try {
    const accessToken = await getAccessToken(ctx.env);
    const result: { wallet_address: string; email: string; country: string; signature: string } = await ctx.request.json();

    console.log("result", result);
    const { wallet_address: wallet, email, country, signature } = result;

    if (!(wallet && email && country && signature)) {
      return Response.json({ message: "Missing parameters" }, { status: 400 });
    }

    const isSigValid = ethers.utils.verifyMessage(`Authentication request for ${wallet.toLowerCase()}`, signature).toLowerCase() == wallet.toLowerCase();
    if (!isSigValid) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("Is sandbox: ", accessToken.isSandbox);
    const apiBaseUrl = accessToken.isSandbox ? "https://api-business.wirexpaychain.tech" : "https://api.wirexpaychain.com";

    console.log("Sending request to", `${apiBaseUrl}/api/v1/user`);

    const response = await fetch(`${apiBaseUrl}/api/v1/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken.token}`,
      },
      body: JSON.stringify({
        email: email,
        wallet_address: wallet,
        country: country,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("API registration successful:", data);
    return Response.json(null, { status: 200 });
  } catch (error) {
    console.error("Error registering with API:", error);
    return Response.json({ message: "Registering user failed" }, { status: 500 });
  }
}
