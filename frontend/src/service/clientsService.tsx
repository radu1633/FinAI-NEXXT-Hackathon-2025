export interface Client {
  id: number;
  name: string;
  age: number;
  gender: string;
  education_level: string;
  marital_status: string;
  income: number;
  credit_score: number;
  loan_amount: number;
  loan_purpose: string;
  employment_status: string;
  years_at_current_job: number;
  payment_history: string;
  debt_to_income_ratio: number;
  assets_value: number;
  number_of_dependents: number;
  city: string;
  state: string;
  country: string;
  previous_defaults: number;
  marital_status_change: number;
  risk_rating: string;
}

const BASE_URL = "http://localhost:8090";

export async function getAllClients(): Promise<Client[]> {
  try {
    const res = await fetch(`${BASE_URL}/clients`);
    if (!res.ok) throw new Error(`Failed to fetch clients: ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error("❌ Error fetching clients:", err);
    throw err;
  }
}
