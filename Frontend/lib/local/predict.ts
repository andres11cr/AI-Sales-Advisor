import predict_data from "@/demo/predict.json";

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
  await new Promise<void>((r) => setTimeout(r, 1500));
  return predict_data as unknown as PredictPayload;
}
