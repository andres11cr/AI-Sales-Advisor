import model from "@/demo/buildModel.json";

export interface ModelPayload {
  metricas: any[];
  summary: {};
  dataset: any[];
}

export async function buildModel(): Promise<ModelPayload> {

  await new Promise<void>((r) => setTimeout(r, 1500));
  return model as unknown as ModelPayload;
}
