"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"

type HistorySeries = { loss: number[]; val_loss: number[] }
type ProductModels = {
  MLP: HistorySeries
  CNN1D: HistorySeries
  LSTM: HistorySeries
  CNN_LSTM: HistorySeries
}

const chartConfig = {
  train: { label: "Train loss", color: "var(--primary)" },
  val:   { label: "Validation loss", color: "var(--muted-foreground)" },
} satisfies ChartConfig

export function ModelEval({metrics}: {metrics: ProductModels}) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("MLP")

  React.useEffect(() => {
    if (isMobile) setTimeRange("MLP")
  }, [isMobile])

  const selected = metrics[timeRange]

  const maxLen = Math.max(selected.loss.length, selected.val_loss.length)
  const data = Array.from({ length: maxLen }, (_, i) => ({
    epoch: i + 1,
    train: selected.loss[i] ?? null,
    val: selected.val_loss[i] ?? null,
  }))

  console.log(data, timeRange)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Evaluación del entrenamiento de los modelos para el producto P001</CardTitle>
        <CardDescription>Métrica: MSE por época</CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="MLP">MLP</ToggleGroupItem>
            <ToggleGroupItem value="CNN1D">CNN1D</ToggleGroupItem>
            <ToggleGroupItem value="LSTM">LSTM</ToggleGroupItem>
            <ToggleGroupItem value="CNN_LSTM">CNN_LSTM</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="Todas las épocas" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="MLP">MLP</SelectItem>
              <SelectItem value="CNN1D">CNN1D</SelectItem>
              <SelectItem value="LSTM">LSTM</SelectItem>
              <SelectItem value="CNN_LSTM">CNN_LSTM</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fill-train" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-train)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-train)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fill-val" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-val)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-val)" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="epoch"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              label={{ value: "Épocas", position: "insideBottom", offset: -6 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              label={{ value: "MSE", angle: -90, position: "insideLeft" }}
            />

            <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : 5}
                // Formatea los valores numéricos del tooltip (loss/val_loss)
                formatter={(value: number) => (value == null ? "—" : value.toFixed(4))}
                // El contenido custom solo recibe props que sí existen
                content={
                    <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(v) => `Época ${v}`}
                    />
                }
            />


            <Area
              dataKey="train"
              name="Train loss"
              type="linear"
              fill="url(#fill-train)"
              stroke="var(--color-train)"
            />
            <Area
              dataKey="val"
              name="Validation loss"
              type="linear"
              fill="url(#fill-val)"
              stroke="var(--color-val)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
