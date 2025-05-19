import { User } from "./wirex-types";

export interface GlobalState {
  isLoading: boolean;
  data: Record<string, unknown>;
}

export interface Session {
  isSandbox: boolean;
  access_token: string;
  /**
   * The time when the access token expires, in epoch seconds.
   */
  expires_at: number;
  wallet: string;
  user: User;
}
