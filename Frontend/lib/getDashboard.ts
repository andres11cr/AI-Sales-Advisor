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
  const base = process.env.NEXT_PUBLIC_API_BASE!;
  const res = await fetch(`${base}/sales/dashboard`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Error fetching dashboard: ${res.status}`);
  }
  return res.json();
}
