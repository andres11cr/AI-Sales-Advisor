import inventory from "@/demo/inventory.json";

export async function getInventory(): Promise<any> {
   await new Promise<void>((r) => setTimeout(r, 1500));
  return inventory as unknown as any;
}