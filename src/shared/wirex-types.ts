export interface GetCardsResponse {
  data: Card[];
  page_number: number;
  page_size: number;
}

export interface Card {
  id: string;
  card_wallet_address: string;
  status: "Requested" | "NotActivated" | "Active" | "Closed" | "Blocked";
  status_reason: string;
  previous_status: "Requested" | "NotActivated" | "Active" | "Closed" | "Blocked" | null;
  card_data: CardData;
  delivery_address?: DeliveryAddress; // Optional as it might not always be present
  balances: Balance[];
  limit: Limit;
  allowed_actions: AllowedAction[];
  created_at: string; // Assuming date-time is represented as a string (ISO 8601)
  updated_at: string | null;
}

export interface CardData {
  name_on_card: string;
  payment_system: "Visa" | "MasterCard";
  card_number_first_4?: string; // Present for plastic cards in 'Requested' or 'NotActivated' status
  card_number_last_4?: string; // Present for 'Active', 'Blocked', or 'Closed' cards
  expiry_date?: string; // Present for 'Active', 'Blocked', or 'Closed' cards (MM/YY format)
  format: "Plastic" | "Virtual";
}

export interface DeliveryAddress {
  line1: string;
  line2?: string;
  country: string;
  city: string;
  zip_code: string;
  state?: string;
}

export interface Balance {
  token_symbol: string;
  token_address: string;
  balance: number;
  is_active: boolean;
}

export interface Limit {
  daily_limit: number;
  daily_usage: number;
}

export interface AllowedAction {
  type: "Activate" | "Block" | "Unblock" | "Close" | "SetActiveBalance" | "SetLimit" | "GetDetails" | "GetCvv" | "GetPin";
  relative_path: string;
}

export interface User {
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
}
