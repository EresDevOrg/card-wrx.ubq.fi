import { ethers } from "ethers";
import { createWirexApiUrl, getAccessToken } from "./shared";
import { Context, UserAuthParams, userAuthParamsSchema } from "./types";
import { Value } from "@sinclair/typebox/value";

export async function onRequestPost(ctx: Context): Promise<Response> {
  try {
    const userAuthParams: UserAuthParams = Value.Decode(userAuthParamsSchema, await ctx.request.json());

    console.log("userAuthParams", userAuthParams);
    const { wallet, signature } = userAuthParams;

    const isSigValid = ethers.utils.verifyMessage(`Authentication request for ${wallet.toLowerCase()}`, signature).toLowerCase() == wallet.toLowerCase();

    if (!isSigValid) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accessToken = await getAccessToken(ctx.env);

    // API endpoint from WirexPayChain partner documentation
    console.log("Is sandbox: ", accessToken.isSandbox);
    const authUrl = createWirexApiUrl("api/v1/user/authorize", accessToken.isSandbox);

    console.log("Sending request to", authUrl);

    const authResponse = await fetch(authUrl, {
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
      throw new Error(`API Error: ${JSON.stringify(errorData)}`);
    }

    const authData = await authResponse.json();
    console.log("User auth successful:", authData);

    const userUrl = createWirexApiUrl("api/v1/user", accessToken.isSandbox);
    console.log("Sending request to:", userUrl);

    const userResponse = await fetch(userUrl, {
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
      throw new Error(`API Error: ${JSON.stringify(errorData)}`);
    }

    const userData = await userResponse.json();
    console.log("User fetch successful:", userData);

    return Response.json({ isSandbox: accessToken.isSandbox, user: userData, ...authData }, { status: 200 });
  } catch (error) {
    console.error("Error registering with API:", error);
    return Response.json({ message: "User authentication failed" }, { status: 500 });
  }
}
