"use client"

import * as React from "react"

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from "./ui/input"

/* =========================================
   1) Schema de repuestos (normalizado)
========================================= */
export const schema = z.object({
  id: z.number(),
  producto: z.string(),
  marca: z.string(),
  numeroSerie: z.string(),
  ventas1: z.number().int(),
  ventas2: z.number().int(),
  ventas3: z.number().int(),
  inventario: z.number().int(),
  forecasting: z.number().int(),
  status: z.enum(["Ok", "Riesgo", "Revisar"]),
})
export type Part = z.infer<typeof schema>

/* Normalizador: mapea claves con espacios a camelCase */
function normalize(row: any): Part {
  return {
    id: Number(row.id),
    producto: row["Producto"],
    marca: row["Marca"],
    numeroSerie: row["Numero de serie"],
    ventas1: Number(row["Ventas_1"]),
    ventas2: Number(row["Ventas_2"]),
    ventas3: Number(row["Ventas_3"]),
    inventario: Number(row["Inventario"]),
    forecasting: Number(row["Forecasting"]),
    status: row["Status"],
  }
}

function loadParts(raw: any[]): Part[] {
  const arr = raw.map(normalize)
  // (Opcional) validar en dev:
  // arr.forEach((r) => schema.parse(r))
  return arr
}

/* =========================================
   2) Drag handle
========================================= */
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

/* =========================================
   3) Columnas para repuestos
========================================= */
const columns: ColumnDef<Part>[] = [
  { id: "drag", header: () => null, cell: ({ row }) => <DragHandle id={row.original.id} /> },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "producto",
    header: "Producto",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    enableHiding: false,
  },
  { accessorKey: "marca", header: "Marca" },
  { accessorKey: "numeroSerie", header: "N° de serie" },

  // Ventas (alineadas a la derecha)
  {
    accessorKey: "ventas1",
    header: () => <div className="w-full text-right">Ventas Agosto 2025</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">{row.original.ventas1}</div>,
  },
  {
    accessorKey: "ventas2",
    header: () => <div className="w-full text-right">Ventas Septiembre 2025</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">{row.original.ventas2}</div>,
  },
  {
    accessorKey: "ventas3",
    header: () => <div className="w-full text-right">Ventas Octubre 2025</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">{row.original.ventas3}</div>,
  },

  // Inventario / Forecasting
  {
    accessorKey: "inventario",
    header: () => <div className="w-full text-right">Inventario</div>,
    cell: ({ row }) => <div className="text-right font-medium tabular-nums">{row.original.inventario}</div>,
  },
  {
    accessorKey: "forecasting",
    header: () => <div className="w-full text-right">Predicción</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">{row.original.forecasting}</div>,
  },

  // Status con badge (colores simples)
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status
      const cls =
        s === "Ok"
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
          : s === "Riesgo"
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
      return <Badge className={`px-2 ${cls}`}>{s}</Badge>
    },
  },

  // Acciones
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={() =>
              toast.promise(new Promise((r) => setTimeout(r, 800)), {
                loading: "Editing…",
                success: "Edited",
                error: "Error",
              })
            }
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

/* =========================================
   4) Fila draggable
========================================= */
function DraggableRow({ row }: { row: Row<Part> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

/* =========================================
   5) DataTable (repuestos) con FILTROS
   - Filtro por Producto (texto)
   - Filtro por Marca (texto)
   - Filtro por Status (select)
========================================= */
export function DataTable({ data: initialRaw }: { data: any[] }) {
  const [data, setData] = React.useState<Part[]>(() => loadParts(initialRaw))
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  // Helpers de filtro
  const productoColumn = table.getColumn("producto")
  const numeroSerieColumn = table.getColumn("numeroSerie")
  const statusColumn = table.getColumn("status")

  const productoFilter = (productoColumn?.getFilterValue() as string) ?? ""
  const numeroSerieFilter = (numeroSerieColumn?.getFilterValue() as string) ?? ""
  const statusFilter = (statusColumn?.getFilterValue() as string) ?? ""

  // Opciones de Status desde los datos (faceted)
  const statusOptions = React.useMemo(() => {
    const v = statusColumn?.getFacetedUniqueValues?.()
    const keys = v ? Array.from(v.keys()) as string[] : ["Ok", "Riesgo", "Revisar"]
    // ordenar por prioridad visual
    return ["Ok", "Riesgo", "Revisar"].filter(k => keys.includes(k)).concat(
      keys.filter(k => !["Ok", "Riesgo", "Revisar"].includes(k))
    )
  }, [statusColumn])

  function resetFilters() {
    table.resetColumnFilters()
  }

  return (
    <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
      {/* ===== Toolbar de filtros ===== */}
      <div className="flex w-full flex-col gap-2 px-4 pt-4 lg:flex-row lg:items-end lg:justify-between lg:px-6">
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:max-w-3xl lg:grid-cols-3">
          {/* Filtro Producto */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="filter-producto">Producto</Label>
            <Input
              id="filter-producto"
              placeholder="Buscar por producto…"
              value={productoFilter}
              onChange={(e) => productoColumn?.setFilterValue(e.target.value)}
            />
          </div>

          {/* Filtro Marca */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="filter-serie">N° de serie</Label>
            <Input
              id="filter-serie"
              placeholder="Buscar por N° de serie…"
              value={numeroSerieFilter}
              onChange={(e) => numeroSerieColumn?.setFilterValue(e.target.value)}
            />
          </div>

          {/* Filtro Status */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="filter-status">Status</Label>
            <Select
              value={statusFilter || "all"}
              onValueChange={(val) => statusColumn?.setFilterValue(val === "all" ? undefined : val)}
            >
              <SelectTrigger id="filter-status">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetFilters}>
            Limpiar filtros
          </Button>
        </div>
      </div>

      {/* ===== Tabla ===== */}
      <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* ===== Paginación ===== */}
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Las otras tabs quedan igual */}
      <TabsContent value="past-performance" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="focus-documents" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}


/* =========================================
   6) Chart (placeholder del Drawer)
========================================= */
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--primary)" },
  mobile: { label: "Mobile", color: "var(--primary)" },
} satisfies ChartConfig

/* =========================================
   7) Viewer del Drawer para repuestos
========================================= */
function TableCellViewer({ item }: { item: Part }) {
  const isMobile = useIsMobile()
  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.producto}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.producto}</DrawerTitle>
          <DrawerDescription>Detalle del repuesto</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart accessibilityLayer data={chartData} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Area dataKey="mobile" type="natural" fill="var(--color-mobile)" fillOpacity={0.6} stroke="var(--color-mobile)" stackId="a" />
                  <Area dataKey="desktop" type="natural" fill="var(--color-desktop)" fillOpacity={0.4} stroke="var(--color-desktop)" stackId="a" />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Trending up by 5.2% this month
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Small placeholder chart. Replace with product KPIs if needed.
                </div>
              </div>
              <Separator />
            </>
          )}
          <div className="grid gap-2">
            <div><b>Marca:</b> {item.marca}</div>
            <div><b>N° de serie:</b> {item.numeroSerie}</div>
            <div className="grid grid-cols-3 gap-2">
              <div><b>V1:</b> {item.ventas1}</div>
              <div><b>V2:</b> {item.ventas2}</div>
              <div><b>V3:</b> {item.ventas3}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><b>Inventario:</b> {item.inventario}</div>
              <div><b>Forecasting:</b> {item.forecasting}</div>
            </div>
            <div><b>Status:</b> {item.status}</div>
          </div>
        </div>
        <DrawerFooter>
          <Button
            onClick={() =>
              toast.promise(new Promise((r) => setTimeout(r, 800)), {
                loading: "Saving…",
                success: "Saved",
                error: "Error",
              })
            }
          >
            Submit
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

/* =========================================
   8) Export opcional (si alguna vez quieres pasar JSON crudo por props)
========================================= */
export default function HondaPartsTable({ rawParts }: { rawParts: any[] }) {
  const initialData = React.useMemo(() => loadParts(rawParts), [rawParts])
  return <DataTable data={initialData} />
}

/* ============================
   USO:
   <DataTable data={jsonCrudoConClavesConEspacios} />
   o
   <HondaPartsTable rawParts={jsonCrudoConClavesConEspacios} />
============================ */
