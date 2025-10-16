"use client"

import { IconEqual, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"


export function ModelCards(props: any) {

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Evaluación de MLP</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {props.summary["P001"]["MLP"]["last"]["val_loss"]}
          </CardTitle>
          <CardAction>
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
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
            {props.summary["P001"]["MLP"]["eval"] === "bueno" ? (
            <>{props.summary["P001"]["MLP"]["desc_1"]} <IconTrendingUp className="size-4" /></>
            ) : props.summary["P001"]["MLP"]["eval"] === "medio" ? (
            <>{props.summary["P001"]["MLP"]["desc_1"]} <IconEqual className="size-4" /></>
            ) : (
            <>{props.summary["P001"]["MLP"]["desc_1"]} <IconTrendingDown className="size-4" /></>
            )}
        </div>
        <div className="text-muted-foreground">
            {props.summary["P001"]["MLP"]["desc_2"]}
        </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Evaluación de CNN1D</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {props.summary["P001"]["CNN1D"]["last"]["val_loss"]}
          </CardTitle>
          <CardAction>
                <Badge 
                variant="outline" 
                aria-label={`Evaluación: ${props.summary["P001"]["CNN1D"]["eval"]}`}
                >
                {props.summary["P001"]["CNN1D"]["eval"] === "bueno" ? (
                    <IconTrendingUp className="mr-1 text-green-500" />
                ) : props.summary["P001"]["CNN1D"]["eval"] === "medio" ? (
                    <IconEqual className="mr-1 text-yellow-500" />
                ) : (
                    <IconTrendingDown className="mr-1 text-red-500" />
                )}
                {props.summary["P001"]["CNN1D"]["eval"]}
                </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
            {props.summary["P001"]["CNN1D"]["eval"] === "bueno" ? (
            <>{props.summary["P001"]["CNN1D"]["desc_1"]} <IconTrendingUp className="size-4" /></>
            ) : props.summary["P001"]["CNN1D"]["eval"] === "medio" ? (
            <>{props.summary["P001"]["CNN1D"]["desc_1"]} <IconEqual className="size-4" /></>
            ) : (
            <>{props.summary["P001"]["CNN1D"]["desc_1"]} <IconTrendingDown className="size-4" /></>
            )}
        </div>
        <div className="text-muted-foreground">
            {props.summary["P001"]["CNN1D"]["desc_2"]}
        </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Evaluación de LSTM</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {props.summary["P001"]["LSTM"]["last"]["val_loss"]}
          </CardTitle>
          <CardAction>
                <Badge 
                variant="outline" 
                aria-label={`Evaluación: ${props.summary["P001"]["LSTM"]["eval"]}`}
                >
                {props.summary["P001"]["LSTM"]["eval"] === "bueno" ? (
                    <IconTrendingUp className="mr-1 text-green-500" />
                ) : props.summary["P001"]["LSTM"]["eval"] === "medio" ? (
                    <IconEqual className="mr-1 text-yellow-500" />
                ) : (
                    <IconTrendingDown className="mr-1 text-red-500" />
                )}
                {props.summary["P001"]["LSTM"]["eval"]}
                </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
            {props.summary["P001"]["LSTM"]["eval"] === "bueno" ? (
            <>{props.summary["P001"]["LSTM"]["desc_1"]} <IconTrendingUp className="size-4" /></>
            ) : props.summary["P001"]["LSTM"]["eval"] === "medio" ? (
            <>{props.summary["P001"]["LSTM"]["desc_1"]} <IconEqual className="size-4" /></>
            ) : (
            <>{props.summary["P001"]["LSTM"]["desc_1"]} <IconTrendingDown className="size-4" /></>
            )}
        </div>
        <div className="text-muted-foreground">
            {props.summary["P001"]["LSTM"]["desc_2"]}
        </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Evaluación de CNN_LSTM</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {props.summary["P001"]["CNN_LSTM"]["last"]["val_loss"]}
          </CardTitle>
          <CardAction>
                <Badge 
                variant="outline" 
                aria-label={`Evaluación: ${props.summary["P001"]["CNN_LSTM"]["eval"]}`}
                >
                {props.summary["P001"]["CNN_LSTM"]["eval"] === "bueno" ? (
                    <IconTrendingUp className="mr-1 text-green-500" />
                ) : props.summary["P001"]["CNN_LSTM"]["eval"] === "medio" ? (
                    <IconEqual className="mr-1 text-yellow-500" />
                ) : (
                    <IconTrendingDown className="mr-1 text-red-500" />
                )}
                {props.summary["P001"]["CNN_LSTM"]["eval"]}
                </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
            {props.summary["P001"]["CNN_LSTM"]["eval"] === "bueno" ? (
            <>{props.summary["P001"]["CNN_LSTM"]["desc_1"]} <IconTrendingUp className="size-4" /></>
            ) : props.summary["P001"]["CNN_LSTM"]["eval"] === "medio" ? (
            <>{props.summary["P001"]["CNN_LSTM"]["desc_1"]} <IconEqual className="size-4" /></>
            ) : (
            <>{props.summary["P001"]["CNN_LSTM"]["desc_1"]} <IconTrendingDown className="size-4" /></>
            )}
        </div>
        <div className="text-muted-foreground">
            {props.summary["P001"]["CNN_LSTM"]["desc_2"]}
        </div>
        </CardFooter>
      </Card>
    </div>
  )
}
