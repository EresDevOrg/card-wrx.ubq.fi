import { Card, User } from "./wirex-types";

export interface GlobalState {
  isLoading: boolean;
  data: Record<string, unknown>;
}

export interface UserAuthToken {
  isSandbox: boolean;
  access_token: string;
  expires_at: number;
  wallet: string;
  user: User;
  card: Card | undefined;
}
