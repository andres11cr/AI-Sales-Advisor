export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-muted-foreground/30 border-t-primary" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Cargando datos…</p>
          <p className="text-xs text-muted-foreground/80">
            Preparando dashboard
          </p>
        </div>
      </div>
    </div>
  )
}
