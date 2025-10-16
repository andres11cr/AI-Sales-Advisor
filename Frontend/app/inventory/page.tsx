import { SiteHeader } from "@/components/site-header"
import { SidebarInset } from "@/components/ui/sidebar"
import { getInventory } from "@/lib/local/inventory"
import { DataTable } from "@/components/data-table"

export default async function Inventory() {
  const inventory = await getInventory()

  console.log(inventory);

  return (
    <SidebarInset>
      <SiteHeader title="Asistente de inventario"/>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DataTable data={inventory} />
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
