import { getAccessToken } from "./shared";
import { Context } from "./types";

export async function onRequestPost(ctx: Context): Promise<Response> {
  try {
    const accessToken = await getAccessToken(ctx.env);
    const result: { wallet: string } = await ctx.request.json();

    console.log("result", result);
    const { wallet } = result;

    console.log("Is sandbox: ", accessToken.isSandbox);
    const apiBaseUrl = accessToken.isSandbox ? "https://api-business.wirexpaychain.tech" : "https://api.wirexpaychain.com";

    console.log("Sending request to", `${apiBaseUrl}/api/v1/user`);

    const response = await fetch(`${apiBaseUrl}/api/v1/user/verification-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken.token}`,
        "X-User-Wallet": wallet,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("API registration successful:", data);
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error("Error registering with API:", error);
    return Response.json({ message: "Registering user failed" }, { status: 500 });
  }
}
