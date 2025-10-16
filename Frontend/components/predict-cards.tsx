"use client"

import { IconEqual, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"


export function PredictCards(data: any) {

  const models = ["MLP", "CNN1D", "LSTM", "CNN_LSTM"]

  console.log(data)

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {models.map((modelKey) => { 
            const s = data["data"]["models"][modelKey]["summary"]
            console.log(s)
            return (
                <Card key={modelKey} className="@container/card">
                    <CardHeader>
                        <CardDescription>Predicción con {modelKey}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {s["total_pred"].toFixed(0)} unidades
                        </CardTitle>
                        {/* <CardAction>
                            <Badge 
                            variant="outline" 
                            aria-label={`Evaluación: ${props.summary["P001"]["MLP"]["eval"]}`}
                            >
                            {props.summary["P001"]["MLP"]["eval"] === "bueno" ? (
                                <IconTrendingUp className="mr-1 text-green-500" />
                            ) : props.summary["P001"]["MLP"]["eval"] === "medio" ? (
                                <IconEqual className="mr-1 text-yellow-500" />
                            ) : (
                                <IconTrendingDown className="mr-1 text-red-500" />
                            )}
                            {props.summary["P001"]["MLP"]["eval"]}
                            </Badge>
                        </CardAction> */}
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {/* <div className="line-clamp-1 flex gap-2 font-medium">
                        {props.summary["P001"]["MLP"]["eval"] === "bueno" ? (
                        <>{props.summary["P001"]["MLP"]["desc_1"]} <IconTrendingUp className="size-4" /></>
                        ) : props.summary["P001"]["MLP"]["eval"] === "medio" ? (
                        <>{props.summary["P001"]["MLP"]["desc_1"]} <IconEqual className="size-4" /></>
                        ) : (
                        <>{props.summary["P001"]["MLP"]["desc_1"]} <IconTrendingDown className="size-4" /></>
                        )}
                    </div> */}
                    <div className="text-muted-foreground">
                         La demanda diaria es de {s["mean_daily"].toFixed(2)} unidades
                    </div>
                    </CardFooter>
                </Card>
            )}
        )}      
    </div>
  )
}
