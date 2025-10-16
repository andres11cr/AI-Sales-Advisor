import { ModelCards } from "@/components/model-cards"
import { ModelEval } from "@/components/model-eval"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset } from "@/components/ui/sidebar"
// import { buildModel } from "@/lib/buildModel"
import { buildModel } from "@/lib/local/buildModel"

type HistorySeries = { loss: number[]; val_loss: number[] }
type ProductModels = {
  MLP: HistorySeries
  CNN1D: HistorySeries
  LSTM: HistorySeries
  CNN_LSTM: HistorySeries
}
type Metricas = Array<Record<string, ProductModels>>

export default async function Model() {
  const model = await buildModel()

  const product = "P001"

  const byProduct: Record<string, ProductModels> = Object.assign(
    {},
    ...(model.metricas as Metricas)
  )

  const productModels = byProduct[product]

  return (
    <SidebarInset>
      <SiteHeader title={"Evaluación del entrenamiento de los modelos para el producto " + product}/>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <ModelCards summary={model.summary} />
              <div className="px-4 lg:px-6">
              <ModelEval 
                metrics={productModels}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
