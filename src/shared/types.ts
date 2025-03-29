export interface GlobalState {
  isLoading: boolean;
  data: Record<string, unknown>;
}

export interface UserAuthToken {
  isSandbox: boolean;
  access_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    wallet_address: string;
    residence_address: {
      country: string;
    };
    verification_status: string;
    user_status: string;
    personal_info: {
      first_name: string;
      last_name: string;
      nationality: string;
    };
    phone_number_data: {
      phone_number: string;
    };
  };
}
