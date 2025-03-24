import { getAccessToken } from "./shared";

export async function onRequest(ctx): Promise<Response> {
  try {
    validateRequestMethod(ctx.request.method, "POST");
    const accessToken = await getAccessToken(ctx.env);
    const result = await ctx.request.json();
    if (!result.success) {
      throw new Error(`Invalid post parameters: ${JSON.stringify(result)}`);
    }
    const { wallet, email, country } = result.data;

    // API endpoint from WirexPayChain partner documentation
    const apiBaseUrl = ctx.env.isSandbox ? "https://api-business.wirexpaychain.tech" : "https://api.wirexpaychain.com";

    const response = await fetch(`${apiBaseUrl}/api/v1/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken.token}`,
        // Add any required API keys or authentication headers here
      },
      body: JSON.stringify({
        email: email,
        wallet_address: wallet,
        country: country, // Add any other required fields based on the API documentation
        // Add any other required fields based on the API documentation
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

export function validateRequestMethod(expectedMethod: string, receivedMethod: string) {
  if (receivedMethod !== expectedMethod) {
    console.error(
      "Invalid request method.",
      JSON.stringify({
        expectedMethod,
        receivedMethod,
      })
    );
    throw new Error("Invalid request method.");
  }
}
