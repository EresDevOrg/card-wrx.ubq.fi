import { EventContext } from "@cloudflare/workers-types";

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
