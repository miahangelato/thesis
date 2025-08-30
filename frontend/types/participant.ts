export interface ParticipantData {
  age: number | string;
  weight: number | string;
  height: number | string;
  gender: "male" | "female";
  blood_type: "O" | "A" | "B" | "AB" | "unknown";
  sleep_hours?: number | string;
  had_alcohol_last_24h?: boolean;
  ate_before_donation?: boolean;
  ate_fatty_food?: boolean;
  recent_tattoo_or_piercing?: boolean;
  has_chronic_condition?: boolean;
  condition_controlled?: boolean;
  last_donation_date?: string;
}