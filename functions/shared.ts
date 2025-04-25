import { AccessToken, Env, WirexAuthResponse } from "./types";

export const WIREX_AUTH_URL_SANDBOX = "https://wirex-pay-dev.eu.auth0.com/oauth/token";
export const WIREX_AUTH_URL_PRODUCTION = "https://wirex-pay-dev.eu.auth0.com/oauth/token";
export const WIREX_API_URL_SANDBOX = "https://api-business.wirexpaychain.tech";
export const WIREX_API_URL_PRODUCTION = "https://api-business.wirexpaychain.tech";

export async function getAccessToken(env: Env): Promise<AccessToken> {
  console.log("Using Wirex Sandbox:", isSandbox(env));
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.WIREX_CLIENT_ID,
      client_secret: env.WIREX_CLIENT_SECRET,
      grant_type: "client_credentials",
      audience: isSandbox(env) ? WIREX_API_URL_SANDBOX : WIREX_API_URL_PRODUCTION,
    }),
  };

  const authUrl = isSandbox(env) ? WIREX_AUTH_URL_SANDBOX : WIREX_AUTH_URL_PRODUCTION;

  const res = await fetch(authUrl, options);

  console.log("Response status:", res.status);

  if (res.status == 200) {
    const successResponse = (await res.json()) as WirexAuthResponse;

    console.log("Access Token successResponse", successResponse);

    return {
      token: successResponse.access_token,
      isSandbox: env.USE_WIREX_SANDBOX !== "false",
      expiresIn: successResponse.expires_in,
    };
  }
  throw new Error(`Getting access token failed: ${JSON.stringify(await res.json())}`);
}

export function isSandbox(env: Env): boolean {
  if (env.USE_WIREX_SANDBOX === "false") {
    return false;
  }
  if (env.USE_WIREX_SANDBOX === "true") {
    return true;
  }
  throw new Error(`Invalid env USE_WIREX_SANDBOX value: ${env.USE_WIREX_SANDBOX}`);
}

export function createWirexApiUrl(path: string, useSandbox: boolean): string {
  if (useSandbox) {
    return `${WIREX_API_URL_SANDBOX}/${path}`;
  }

  return `${WIREX_API_URL_PRODUCTION}/${path}`;
}
