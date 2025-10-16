export interface ModelSummary {
  total_pred: number;
  total_low: number;
  total_up: number;
  mean_daily: number;
  median: number;
}

export interface ModelForecast {
  dates: string[];
  pred: number[];
  lower: number[];
  upper: number[];
}

export interface ModelHistory {
  dates: string[];
  values: number[];
}

export interface ModelResult {
  history: ModelHistory;
  forecast: ModelForecast;
  summary: ModelSummary;
}

export interface ProductResult {
  product_code: string;
  models: Record<string, ModelResult>; // MLP, CNN1D, LSTM, etc.
}

export type PredictPayload = ProductResult[];

export async function predict(): Promise<PredictPayload> {
  const base = process.env.NEXT_PUBLIC_API_BASE!;
  console.log(base)
  const res = await fetch(`${base}/models/predict`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Error fetching predict: ${res.status}`);
  }
  return res.json();
}
