"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"

// --- Configuración para shadcn charts (colores/labels) ---
const chartConfig = {
  hist:  { label: "Real (histórico)", color: "var(--primary)" },
  pred:  { label: "Pronóstico (90 días)", color: "var(--chart-2)" },
  date:  { label: "Historico", color: "var(--muted-foreground)" }
} satisfies ChartConfig

type ForecastData = {
  date: string;
  hist?: number | null;
  pred?: number | null;
  lower?: number | null;
  upper?: number | null;
};


export function ForecastDemo(data: any) {
  
  const isMobile = useIsMobile()
  const [modelRange, setModelRange] = React.useState("MLP")

  React.useEffect(() => {
      if (isMobile) setModelRange("MLP")
    }, [isMobile])

  console.log(data["data"]);
  
  console.log(modelRange);

  console.log(data["data"]["models"][modelRange]);

    const forecast_data = [
      ...data.data.models[modelRange].history.dates.map((d: string, i: number) => ({
        date: d,
        hist: data.data.models[modelRange].history.values[i],
        pred: null,
        lower: null,
        upper: null,
      })),
      ...data.data.models[modelRange].forecast.dates.map((d: string, i: number) => ({
        date: d,
        hist: null,
        pred: data.data.models[modelRange].forecast.pred[i],
        lower: data.data.models[modelRange].forecast.lower[i],
        upper: data.data.models[modelRange].forecast.upper[i],
      })),
    ].map(r => ({
      ...r,
      lowerBase: r.lower ?? null,
      bandHeight:
        r.lower != null && r.upper != null ? Number((r.upper - r.lower).toFixed(4)) : null,
    }));


    console.log(forecast_data);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Evaluación del entrenamiento de los modelos para el producto P001</CardTitle>
        <CardDescription>Métrica: MSE por época</CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={modelRange}
            onValueChange={(v) => v && setModelRange(v)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="MLP">MLP</ToggleGroupItem>
            <ToggleGroupItem value="CNN1D">CNN1D</ToggleGroupItem>
            <ToggleGroupItem value="LSTM">LSTM</ToggleGroupItem>
            <ToggleGroupItem value="CNN_LSTM">CNN_LSTM</ToggleGroupItem>
          </ToggleGroup>
          <Select value={modelRange} onValueChange={setModelRange}>
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
<ChartContainer config={chartConfig} className="aspect-auto h-[360px] w-full">
  <LineChart data={forecast_data}>
    <defs>
      {/* degradado visible para la banda */}
      <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor="var(--muted-foreground)" stopOpacity={0.28} />
        <stop offset="95%" stopColor="var(--muted-foreground)" stopOpacity={0.08} />
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis domain={['dataMin-2','dataMax+2']} />
    <Tooltip />

    {/* 2) Banda de confianza: apilar base invisible + altura */}
    <Area
      type="monotone"
      dataKey="lowerBase"
      stackId="ci"
      stroke="none"
      fill="transparent"
      connectNulls
      isAnimationActive={false}
    />
    <Area
      type="monotone"
      dataKey="bandHeight"
      name="Banda (±1.96σ)"
      stackId="ci"
      stroke="none"
      fill="url(#bandFill)"
      connectNulls
      isAnimationActive={false}
    />

    {/* 3) Series */}
    <Line type="monotone" dataKey="hist" name="Histórico" stroke="#000" dot={false} />
    <Line type="monotone" dataKey="pred" name="Pronóstico" stroke="#ff7300" dot={false} />
    <Legend />
  </LineChart>
</ChartContainer>

      </CardContent>
    </Card>
  )
}
