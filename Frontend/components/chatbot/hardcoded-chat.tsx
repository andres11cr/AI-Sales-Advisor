"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type Msg = { role: "user" | "assistant"; content: string }

// === Datos hardcoded (inventario + KPIs) ===
const parts = [
  { producto: "Oil Filter", marca: "Honda", inventario: 16, forecasting: 15, status: "Ok" },
  { producto: "Motor Oil 0W-20", marca: "Honda", inventario: 24, forecasting: 90, status: "Riesgo" },
  { producto: "Brake Pads Front", marca: "Honda", inventario: 42, forecasting: 144, status: "Riesgo" },
  { producto: "Coolant Type 2", marca: "Honda", inventario: 51, forecasting: 120, status: "Riesgo" },
  { producto: "Air Filter", marca: "Honda", inventario: 24, forecasting: 90, status: "Riesgo" },
  { producto: "Battery 12V", marca: "Honda", inventario: 22, forecasting: 90, status: "Riesgo" },
]

const kpis = {
  rotacionDias: 37,
  fillRate: 0.92,
  stockoutsMes: 5,
  tendenciaVentas3m: "+7.4%",
}

// === Preguntas predefinidas ===
const quickPrompts = [
  "¿Qué repuestos están en riesgo este mes?",
  "Recomienda órdenes de compra para 2 semanas",
  "Top 3 productos con mayor rotación",
  "¿Tenemos stock para cubrir 3 meses en filtros?",
  "Sugerencias para reducir stock inmovilizado",
]

// === Motor de respuesta súper simple (hardcoded) ===
function answer(q: string): string {
  const low = q.toLowerCase()

  if (low.includes("riesgo")) {
    const riesgo = parts.filter(p => p.status === "Riesgo")
    const lines = riesgo.map(p => `• ${p.producto} — Inv ${p.inventario} vs Fcst ${p.forecasting}`)
    return `Repuestos en riesgo (Inventario < Forecasting):\n${lines.join("\n")}\n\nSugerencia: prioriza compra en lotes pequeños y revisa lead time de proveedores.`
  }

  if (low.includes("órdenes") || low.includes("ordenes") || low.includes("compra")) {
    // Orden sugerida = max(0, Fcst - Inv) con colchón del 10%
    const plan = parts.map(p => {
      const need = Math.max(0, p.forecasting - p.inventario)
      const padded = Math.ceil(need * 1.1)
      return { name: p.producto, qty: padded }
    }).filter(x => x.qty > 0)
    const lines = plan.map(x => `• ${x.name}: ${x.qty} u.`)
    return plan.length
      ? `Orden sugerida (horizonte 3 meses +10% colchón):\n${lines.join("\n")}`
      : "No se requieren órdenes: inventario suficiente para el horizonte de 3 meses."
  }

  if (low.includes("rotación") || low.includes("rotacion") || low.includes("top 3")) {
    // “Rotación” aproximada: Forecasting más alto
    const top = [...parts].sort((a, b) => b.forecasting - a.forecasting).slice(0, 3)
    const lines = top.map((p, i) => `${i + 1}. ${p.producto} — Fcst ${p.forecasting}, Inv ${p.inventario}`)
    return `Top 3 por rotación estimada:\n${lines.join("\n")}\n\nKPI: Rotación promedio ~${kpis.rotacionDias} días; Tendencia 3m: ${kpis.tendenciaVentas3m}.`
  }

  if (low.includes("3 meses") && (low.includes("filtro") || low.includes("filtros"))) {
    const filtros = parts.filter(p => p.producto.toLowerCase().includes("filter"))
    const lines = filtros.map(p => {
      const ok = p.inventario >= p.forecasting ? "✅" : "⚠️"
      return `• ${p.producto}: Inv ${p.inventario} / Fcst ${p.forecasting} ${ok}`
    })
    return `Cobertura de 3 meses (familia filtros):\n${lines.join("\n")}`
  }

  if (low.includes("inmovilizado") || low.includes("sobrestock") || low.includes("reducir stock")) {
    return [
      "Sugerencias para reducir stock inmovilizado:",
      "1) ABC + políticas por clase (A: reorden semanal; B: quincenal; C: mensual).",
      "2) Lotes mínimos dinámicos en base a variabilidad y lead time.",
      "3) Liquidar cola de C con bundles (ej. Washer + Oil Filter).",
      "4) Alinear compras a pronóstico (Fcst) y estacionalidad.",
      `5) Control de fill-rate actual: ${(kpis.fillRate * 100).toFixed(0)}% (meta ≥ 95%).`,
    ].join("\n")
  }

  // Respuesta por defecto
  return `Puedo ayudarte con: riesgo de stock, órdenes sugeridas, rotación/top, cobertura por familia y acciones para inmovilizado. Pregúntame algo como: “¿Qué repuestos están en riesgo este mes?”`
}

export default function HardcodedChat() {
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "assistant", content: "Hola 👋 Soy tu AI Sales Advisor para repuestos Honda. ¿En qué te apoyo hoy?" },
    { role: "user", content: "Quiero ver qué está en riesgo este mes." },
    { role: "assistant", content: answer("riesgo") },
  ])
  const [input, setInput] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  const onSend = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content) return
    setMessages(prev => [...prev, { role: "user", content }])
    setInput("")
    setBusy(true)
    // delay pequeño para simular "pensando…"
    await new Promise(r => setTimeout(r, 500))
    setMessages(prev => [...prev, { role: "assistant", content: answer(content) }])
    setBusy(false)
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-xl border bg-card shadow-sm">
      {/* Header mini KPIs */}
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <Badge variant="secondary">Rotación ~ {kpis.rotacionDias} días</Badge>
        <Badge variant="secondary">Fill-rate {Math.round(kpis.fillRate * 100)}%</Badge>
        <Badge variant="secondary">Stockouts (30d): {kpis.stockoutsMes}</Badge>
        <Badge variant="secondary">Tendencia 3m: {kpis.tendenciaVentas3m}</Badge>
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {quickPrompts.map((q) => (
          <Button key={q} variant="outline" size="sm" onClick={() => onSend(q)}>
            {q}
          </Button>
        ))}
      </div>

      <Separator />

      {/* Chat history */}
      <div className="flex max-h-[480px] flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-3 py-2 text-sm italic opacity-80">
              pensando…
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Escribe tu mensaje…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
          />
          <Button onClick={() => onSend()} disabled={busy || !input.trim()}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  )
}
