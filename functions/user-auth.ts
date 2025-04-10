import { ethers } from "ethers";
import { getAccessToken } from "./shared";
import { Context } from "./types";

export async function onRequestPost(ctx: Context): Promise<Response> {
  try {
    const result: { wallet: string; signature: string } = await ctx.request.json();

    console.log("result", result);
    const { wallet, signature } = result;

    if (!wallet || !signature) {
      return Response.json({ message: "Missing wallet or signature" }, { status: 400 });
    }

    const isSigValid = ethers.utils.verifyMessage(`Authentication request for ${wallet}`, signature) == wallet;

    if (!isSigValid) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accessToken = await getAccessToken(ctx.env);

    // API endpoint from WirexPayChain partner documentation
    console.log("Is sandbox: ", accessToken.isSandbox);
    const apiBaseUrl = accessToken.isSandbox ? "https://api-business.wirexpaychain.tech" : "https://api.wirexpaychain.com";

    console.log("Sending request to", `${apiBaseUrl}/api/v1/user/authorize`);

    const authResponse = await fetch(`${apiBaseUrl}/api/v1/user/authorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken.token}`,
        "X-User-Wallet": wallet,
      },
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      throw new Error(`API Error: ${errorData.message || authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    console.log("User auth successful:", authData);

    const userResponse = await fetch(`${apiBaseUrl}/api/v1/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authData.access_token}`,
        "X-User-Wallet": wallet,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      throw new Error(`API Error: ${errorData.message || userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    console.log("User fetch successful:", userData);

    return Response.json({ isSandbox: accessToken.isSandbox, user: userData, ...authData }, { status: 200 });
  } catch (error) {
    console.error("Error registering with API:", error);
    return Response.json({ message: "User authentication failed" }, { status: 500 });
  }
}
