import { ethers } from "ethers";
import { createWirexApiUrl, getAccessToken } from "./shared";
import { Context, RegisterParams, registerParamsSchema } from "./types";
import { Value } from "@sinclair/typebox/value";

export async function onRequestPost(ctx: Context): Promise<Response> {
  try {
    const accessToken = await getAccessToken(ctx.env);
    const registerParams: RegisterParams = Value.Decode(registerParamsSchema, await ctx.request.json());

    console.log("registerParams", registerParams);
    const { wallet_address: wallet, email, country, signature } = registerParams;

    const isSigValid = ethers.utils.verifyMessage(`Authentication request for ${wallet.toLowerCase()}`, signature).toLowerCase() == wallet.toLowerCase();
    if (!isSigValid) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("Is sandbox: ", accessToken.isSandbox);
    const userUrl = createWirexApiUrl("api/v1/user", accessToken.isSandbox);

    console.log("Sending request to", `${userUrl}`);

    const response = await fetch(userUrl, {
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
