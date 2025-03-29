/* eslint-disable check-file/filename-naming-convention */

import { isSandbox } from "./../shared";

export async function onRequest(ctx): Promise<Response> {
  try {
    // Get the request details from the incoming context
    const request = ctx.request;
    const url = new URL(request.url);
    const path = url.pathname.replace("/proxy", ""); // Remove proxy prefix if present

    console.log("Proxying request to", `${isSandbox(ctx.env) ? "https://api-business.wirexpaychain.tech" : "https://api.wirexpaychain.com"}${path}`);

    // Prepare the forwarded request
    const response = await fetch(`${isSandbox(ctx.env) ? "https://api-business.wirexpaychain.tech" : "https://api.wirexpaychain.com"}${path}`, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `${request.headers.get("Authorization")}`,
        "X-User-Wallet": `${request.headers.get("X-User-Wallet")}`,
      }, //{ ...Object.fromEntries(request.headers) },
      body: request.body ? await request.text() : undefined, // Forward request body if present
    });

    console.log({
      method: request.method,
      headers: request.headers,
      //body: request.body ? await request.text() : undefined, // Forward request body if present
    });
    console.log("headers", {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `${request.headers.get("Authorization")}`,
      "X-User-Wallet": `${request.headers.get("X-User-Wallet")}`,
    });
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.log("errorData", errorData);
      throw new Error(`Wirex API Error: ${errorData.message || response.statusText}`);
    }

    // Get the response data
    const data = await response.json();
    console.log("Wirex API response:", data);

    // Return the proxied response
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error proxying to Wirex API:", error);
    return new Response(JSON.stringify({ message: "Wirex proxy request failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
