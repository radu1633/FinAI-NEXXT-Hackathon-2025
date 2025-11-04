// src/services/investmentsService.ts
export interface Investment {
  id: number;
  name: string;
  category?: string;
  risk_score: string;
  expected_return?: number;
  minimum_amount?: number;
  description?: string;
  investment: string;
}

const API_URL = "http://localhost:8090/investments";

export async function fetchInvestments(): Promise<Investment[]> {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error(`Failed to fetch investments: ${res.statusText}`);
    }

    const data = await res.json();
    return data as Investment[];
  } catch (error) {
    console.error("❌ Error in fetchInvestments:", error);
    return [];
  }
}
