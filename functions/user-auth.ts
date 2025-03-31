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
