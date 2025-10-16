export interface ModelPayload {
  metricas: any[];
  summary: {};
  dataset: any[];
}

export async function buildModel(): Promise<ModelPayload> {
  const base = process.env.NEXT_PUBLIC_API_BASE!;

  const res = await fetch(`${base}/models/build`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Error fetching dashboard: ${res.status}`);
  }
  return res.json();
}
