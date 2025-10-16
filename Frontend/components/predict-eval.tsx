"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"

import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent"

// ==== Tipos que calzan con tu output del backend ====
type HistoryBlock = { dates: string[]; values: number[] }
type ForecastBlock = { dates: string[]; pred: number[]; lower: number[]; upper: number[] }
type ModelBlock = {
  history: HistoryBlock
  forecast: ForecastBlock
  summary?: Record<string, number | string | null>
  metrics?: Record<string, number | null>
}
type ProductModelsForecast = {
  MLP: ModelBlock
  CNN1D: ModelBlock
  LSTM: ModelBlock
  CNN_LSTM: ModelBlock
}

const chartConfig = {
  hist:   { label: "Histórico",       color: "var(--muted-foreground)" },
  pred:   { label: "Pronóstico",      color: "var(--primary)" },
  bandCI: { label: "IC 95% (banda)",  color: "var(--primary)" },
} satisfies ChartConfig

const tooltipFormatter = (
  value: ValueType,
  name: NameType,
  item: any
): [string, string] => {
  // ejemplo especial para banda de confianza (si lo usas)
  if (name === "Banda IC") {
    const base  = Number(item?.payload?.ciBase)
    const range = Number(item?.payload?.ciRange)
    if (Number.isFinite(base) && Number.isFinite(range)) {
      const upper = base + range
      return [`[${base.toFixed(2)}, ${upper.toFixed(2)}]`, String(name)]
    }
  }

  const num = typeof value === "number" ? value : Number(value as any)
  return [Number.isFinite(num) ? num.toFixed(2) : "—", String(name)]
}


export function PredictEval(data: any) {
  const isMobile = useIsMobile()
  const [modelKey, setModelKey] = React.useState<keyof ProductModelsForecast>("MLP")

  console.log(data["data"])

  React.useEffect(() => {
    if (isMobile) setModelKey("MLP")
  }, [isMobile])

  const m = data["data"]["models"][modelKey]

  // ---- Prepara data: concatenar history + forecast ----
  // Banda de confianza: usamos la técnica "base + range"
  const histData = m.history.dates.map((d: any, i: any) => ({
    date: d,
    hist: m.history.values[i] ?? 0,
    pred: 0,
    ciBase: 0,
    ciRange: 0,
  }))

  const fcData = m.forecast.dates.map((d: any, i: any) => {
    const lower = m.forecast.lower[i] ?? null
    const upper = m.forecast.upper[i] ?? null
    const range = lower != null && upper != null ? Math.max(upper - lower, 0) : null
    return {
      date: d,
      hist: null,
      pred: m.forecast.pred[i] ?? 0,
      ciBase: lower ?? 0,
      ciRange: range ?? 0,
    }
  })

  const chart_data = [...histData, ...fcData]

  console.log(chart_data)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Pronóstico y histórico — </CardTitle>
        <CardDescription>Serie diaria con banda de confianza (≈95%)</CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={modelKey}
            onValueChange={(v) => v && setModelKey(v as keyof ProductModelsForecast)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="MLP">MLP</ToggleGroupItem>
            <ToggleGroupItem value="CNN1D">CNN1D</ToggleGroupItem>
            <ToggleGroupItem value="LSTM">LSTM</ToggleGroupItem>
            <ToggleGroupItem value="CNN_LSTM">CNN + LSTM</ToggleGroupItem>
          </ToggleGroup>
          <Select value={modelKey} onValueChange={(v) => setModelKey(v as keyof ProductModelsForecast)}>
            <SelectTrigger className="w-48 @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="Modelo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="MLP">MLP</SelectItem>
              <SelectItem value="CNN1D">CNN1D</SelectItem>
              <SelectItem value="LSTM">LSTM</SelectItem>
              <SelectItem value="CNN_LSTM">CNN + LSTM</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <AreaChart data={chart_data}>
            <defs>
              {/* Banda de confianza */}
              <linearGradient id="fill-ci" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-pred)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-pred)" stopOpacity={0.03} />
              </linearGradient>
              {/* Hist y pred para rellenos suaves */}
              <linearGradient id="fill-hist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-hist)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-hist)" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="fill-pred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-pred)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-pred)" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("es-CR", { month: "short", day: "numeric" })
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => (v == null ? "" : Number(v).toFixed(0))}
            />

            <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : Math.max(0, data.length - 10)}
                formatter={tooltipFormatter}
                content={
                    <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(v) =>
                        // si tu eje X es fecha:
                        typeof v === "string"
                        ? new Date(v).toLocaleDateString("es-CR", { month: "short", day: "numeric" })
                        : `Época ${v}`
                    }
                    />
                }
            />

            {/* Banda de confianza: base (lower) + range (upper-lower) */}
            <Area dataKey="ciBase" stackId="ci" stroke="none" fill="transparent" />
            <Area dataKey="ciRange" stackId="ci" name="Banda IC" type="linear" stroke="none" fill="url(#fill-ci)" />

            {/* Histórico */}
            <Area
              dataKey="hist"
              name="Histórico"
              type="monotone"
              fill="url(#fill-hist)"
              stroke="var(--color-hist)"
            />

            {/* Pronóstico (línea central) */}
            <Area
              dataKey="pred"
              name="Pronóstico"
              type="monotone"
              fill="url(#fill-pred)"
              stroke="var(--color-pred)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
