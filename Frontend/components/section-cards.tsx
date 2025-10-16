"use client"

import { IconEqual, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  last_quarter_range: string
  last_quarter_total_sales: string
  last_quarter_total_invoices: string
  last_quarter_invoice_rate: string
  last_quarter_sale_rate: string
  current_quarter_range: string
  current_quarter_total_sales: string
  current_quarter_invoice_rate: string
  current_quarter_sale_rate: string
  current_quarter_total_invoices: string;
}

export function SectionCards(props: Props) {

  const sale_rate = Number(String(props.current_quarter_sale_rate).replace(/[^\d.-]/g, ""))
  const sale_rate_isNeg = sale_rate < 0
  const sale_rate_isPos = sale_rate > 0
  const invoice_rate = Number(String(props.current_quarter_invoice_rate).replace(/[^\d.-]/g, "")) 
  const invoice_rate_isNeg = invoice_rate < 0
  const invoice_rate_isPos = invoice_rate > 0
  const sale_rate_2 = Number(String(props.last_quarter_sale_rate).replace(/[^\d.-]/g, ""))
  const sale_rate_isNeg_2 = sale_rate_2 < 0
  const sale_rate_isPos_2 = sale_rate_2 > 0
  const invoice_rate_2 = Number(String(props.last_quarter_invoice_rate).replace(/[^\d.-]/g, "")) 
  const invoice_rate_isNeg_2 = invoice_rate_2 < 0
  const invoice_rate_isPos_2 = invoice_rate_2 > 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ventas totales del trimestre actual</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {props.current_quarter_total_sales}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" aria-label={`Variación: ${props.current_quarter_sale_rate}`}>
              {sale_rate_isNeg ? <IconTrendingDown className="mr-1" /> : sale_rate_isPos ? <IconTrendingUp className="mr-1" /> : <IconEqual className="mr-1" />}
              {props.current_quarter_sale_rate}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {sale_rate_isNeg ? (
              <>Ventas disminuyeron este período <IconTrendingDown className="size-4" /></>
            ) : sale_rate_isPos ? (
              <>Ventas subieron este período <IconTrendingUp className="size-4" /></>
            ) : (
              <>Ventas sin cambios <IconEqual className="size-4" /></>
            )}
          </div>
          <div className="text-muted-foreground">
            {props.current_quarter_range}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Facturas totales del trimestre actual</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {props.current_quarter_total_invoices}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" aria-label={`Variación: ${props.current_quarter_invoice_rate}`}>
              {invoice_rate_isNeg ? <IconTrendingDown className="mr-1" /> : invoice_rate_isPos ? <IconTrendingUp className="mr-1" /> : <IconEqual className="mr-1" />}
              {props.current_quarter_invoice_rate}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {sale_rate_isNeg ? (
              <>No. facturas disminuyeron este período <IconTrendingDown className="size-4" /></>
            ) : sale_rate_isPos ? (
              <>No. facturas subieron este período <IconTrendingUp className="size-4" /></>
            ) : (
              <>No. facturas sin cambios <IconEqual className="size-4" /></>
            )}
          </div>
          <div className="text-muted-foreground">
            {props.current_quarter_range}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ventas totales del trimestre anterior</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {props.last_quarter_total_sales}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" aria-label={`Variación: ${props.last_quarter_sale_rate}`}>
              {sale_rate_isNeg_2 ? <IconTrendingDown className="mr-1" /> : sale_rate_isPos_2 ? <IconTrendingUp className="mr-1" /> : <IconEqual className="mr-1" />}
              {props.last_quarter_sale_rate}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {sale_rate_isNeg_2 ? (
              <>Ventas disminuyeron este período <IconTrendingDown className="size-4" /></>
            ) : sale_rate_isPos_2 ? (
              <>Ventas subieron este período <IconTrendingUp className="size-4" /></>
            ) : (
              <>Ventas sin cambios <IconEqual className="size-4" /></>
            )}
          </div>
          <div className="text-muted-foreground">
            {props.last_quarter_range}
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Facturas totales del trimestre pasado</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {props.last_quarter_total_invoices}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" aria-label={`Variación: ${props.last_quarter_invoice_rate}`}>
              {invoice_rate_isNeg_2 ? <IconTrendingDown className="mr-1" /> : invoice_rate_isPos_2 ? <IconTrendingUp className="mr-1" /> : <IconEqual className="mr-1" />}
              {props.last_quarter_invoice_rate}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {invoice_rate_isNeg_2 ? (
              <>No. facturas disminuyeron este período <IconTrendingDown className="size-4" /></>
            ) : invoice_rate_isPos_2 ? (
              <>No. facturas subieron este período <IconTrendingUp className="size-4" /></>
            ) : (
              <>No. facturas sin cambios <IconEqual className="size-4" /></>
            )}
          </div>
          <div className="text-muted-foreground">
            {props.current_quarter_range}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
