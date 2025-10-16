import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset } from "@/components/ui/sidebar"
import { getDashboard } from "@/lib/local/getDashboard"
// import { getDashboard } from "@/lib/getDashboard"

export default async function Dashboard() {
  const dashboard = await getDashboard()

  return (
    <SidebarInset>
      <SiteHeader title="Dashboard"/>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards
              last_quarter_range={dashboard.last_quarter_range}
              last_quarter_total_sales={dashboard.last_quarter_total_sales}
              last_quarter_invoice_rate={dashboard.last_quarter_invoice_rate}
              last_quarter_sale_rate={dashboard.last_quarter_sale_rate}
              last_quarter_total_invoices={dashboard.last_quarter_total_invoices}
              current_quarter_range={dashboard.current_quarter_range}
              current_quarter_total_sales={dashboard.current_quarter_total_sales}
              current_quarter_invoice_rate={dashboard.current_quarter_invoice_rate}
              current_quarter_sale_rate={dashboard.current_quarter_sale_rate}
              current_quarter_total_invoices={dashboard.current_quarter_total_invoices}
            />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive 
                sales={dashboard.sales}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
