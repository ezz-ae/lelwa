export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/10" />
          <span className="relative inline-flex h-5 w-5 rounded-full bg-foreground/20" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground/50">Lelwa</p>
      </div>
    </div>
  )
}
