import dashboard from "@/demo/dashboard.json";

export interface DashboardPayload {
  last_quarter_range: string;
  last_quarter_total_sales: string;
  last_quarter_sale_rate: string;
  last_quarter_total_invoices: string;
  last_quarter_invoice_rate: string;
  current_quarter_range: string;
  current_quarter_total_sales: string;
  current_quarter_sale_rate: string;
  current_quarter_total_invoices: string;
  current_quarter_invoice_rate: string;
  sales: [];
}

export async function getDashboard(): Promise<DashboardPayload> {
   await new Promise<void>((r) => setTimeout(r, 1500));
  return dashboard as unknown as DashboardPayload;
}