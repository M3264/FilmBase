import { Skeleton } from "@/components/ui/skeleton"

function Block({ className = "" }: { className?: string }) {
  return <Skeleton className={`rounded-none ${className}`} />
}

export default function Loading() {
  return (
    <div className="min-h-screen" aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading FilmBase shelf</p>
      <header className="border-b border-border bg-background/95">
        <div className="site-shell flex h-[4.5rem] items-center justify-between gap-6">
          <Block className="h-8 w-28" />
          <div className="hidden items-center gap-5 sm:flex">
            <Block className="h-3 w-16" />
            <Block className="h-3 w-20" />
            <Block className="h-3 w-14" />
            <Block className="h-8 w-8" />
          </div>
          <Block className="h-9 w-9 sm:hidden" />
        </div>
        <div className="site-shell flex h-11 items-center gap-4 overflow-hidden border-t border-border">
          {["w-16", "w-20", "w-14", "w-20", "w-16"].map((width, index) => <Block key={index} className={`h-3 shrink-0 ${width}`} />)}
        </div>
      </header>

      <main className="site-shell pb-16 pt-24 sm:pt-28">
        <div className="mb-8 grid gap-7 border-y border-border py-8 md:grid-cols-[minmax(0,1fr)_17rem] md:items-end">
          <div><Block className="h-3 w-40" /><Block className="mt-5 h-20 w-[min(100%,34rem)] sm:h-28" /></div>
          <div className="border-l-4 border-border pl-4"><Block className="h-3 w-20" /><Block className="mt-4 h-12 w-full" /></div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => <div key={index}><Block className="aspect-[2/3] w-full" /><Block className="mt-3 h-3 w-4/5" /><Block className="mt-2 h-2.5 w-2/5" /></div>)}
        </div>
      </main>
    </div>
  )
}
