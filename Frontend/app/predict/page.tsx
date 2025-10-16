import { ForecastDemo } from "@/components/forecast-demo"
import { PredictCards } from "@/components/predict-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset } from "@/components/ui/sidebar"
import { predict } from "@/lib/local/predict"

export default async function Predict() {
  const predict_data = await predict()

  console.log(predict_data);

  // Producto parametrizable (por ahora fijo con fallback a P001)
  const product = "P001"

  // Buscar el row correspondiente al producto
  const row = predict_data.find((item) => item.product_code === product)

  if (!row) {
    throw new Error(`No metrics found for product ${product}`)
  }

  console.log(row)

  return (
    <SidebarInset>
      <SiteHeader title={`Evaluación de la predicción de modelos para ${product} para 3 meses`} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <PredictCards data={row} />
            <div className="px-4 lg:px-6">
              <ForecastDemo data={row}/>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
