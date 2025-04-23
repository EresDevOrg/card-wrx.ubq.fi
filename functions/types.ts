import { EventContext } from "@cloudflare/workers-types";
import { Type, type Static } from "@sinclair/typebox";

export interface Env {
  USE_WIREX_SANDBOX: string;
  WIREX_CLIENT_ID: string;
  WIREX_CLIENT_SECRET: string;
}

export interface AccessToken {
  token: string;
  isSandbox: boolean;
  expiresIn: number; // in seconds
}

export interface WirexAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export type Context = EventContext<Env, string, Record<string, string>>;

export const registerParamsSchema = Type.Object({
  wallet_address: Type.String(),
  email: Type.String({ format: "email" }),
  country: Type.String({ format: "iso3166-1-alpha-2" }),
  signature: Type.String(),
});

export type RegisterParams = Static<typeof registerParamsSchema>;

export const userAuthParamsSchema = Type.Object({
  wallet: Type.String(),
  signature: Type.String(),
});

export type UserAuthParams = Static<typeof userAuthParamsSchema>;
