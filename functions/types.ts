import { EventContext } from "@cloudflare/workers-types";
import { Env } from "./shared";

export interface WirexAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export type Context = EventContext<Env, string, Record<string, string>>;
