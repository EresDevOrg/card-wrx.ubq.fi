import { validateRequestMethod } from "./register";
import { getAccessToken } from "./shared";

export async function onRequest(ctx): Promise<Response> {
  try {
    validateRequestMethod(ctx.request.method, "POST");
    const accessToken = await getAccessToken(ctx.env);
    const result = await ctx.request.json();
    // if (!result.success) {
    //   throw new Error(`Invalid post parameters: ${JSON.stringify(result)}`);
    // }
    console.log("result", result);
    const { wallet } = result;

    // API endpoint from WirexPayChain partner documentation
    console.log("Is sandbox: ", accessToken.isSandbox);
    const apiBaseUrl = accessToken.isSandbox ? "https://api-business.wirexpaychain.tech" : "https://api.wirexpaychain.com";

    console.log("Sending request to", `${apiBaseUrl}/api/v1/user/authorize`);

    const response = await fetch(`${apiBaseUrl}/api/v1/user/authorize`, {
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
