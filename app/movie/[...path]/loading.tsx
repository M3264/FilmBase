import { Skeleton } from "@/components/ui/skeleton"

function Line({ className = "" }: { className?: string }) {
  return <Skeleton className={`rounded-none ${className}`} />
}

export default function MovieLoading() {
  return (
    <div className="min-h-screen" aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading title details</p>
      <div className="border-b border-border bg-background/95">
        <div className="site-shell flex h-[4.5rem] items-center justify-between gap-6">
          <Line className="h-7 w-28" />
          <div className="hidden items-center gap-5 sm:flex">
            <Line className="h-3 w-16" />
            <Line className="h-3 w-20" />
            <Line className="h-3 w-14" />
          </div>
          <Line className="h-9 w-9 sm:hidden" />
        </div>
      </div>

      <main className="site-shell pb-16 pt-24 sm:pt-28">
        <div className="mb-6 flex gap-2" aria-hidden="true">
          <Line className="h-3 w-12" />
          <Line className="h-3 w-3" />
          <Line className="h-3 w-20" />
        </div>

        <article className="grid gap-8 border-y border-border py-7 md:grid-cols-[minmax(14rem,23rem)_minmax(0,1fr)] md:gap-12 md:py-10">
          <div className="mx-auto w-full max-w-[23rem] md:mx-0">
            <Skeleton className="aspect-[2/3] w-full rounded-none poster-shadow" />
            <div className="mt-5 flex gap-2">
              <Line className="h-6 w-16" />
              <Line className="h-6 w-20" />
              <Line className="h-6 w-14" />
            </div>
          </div>

          <div className="min-w-0 md:pt-3">
            <Line className="h-3 w-48" />
            <Line className="mt-5 h-20 w-[min(100%,34rem)] sm:h-28" />
            <div className="mt-7 grid grid-cols-2 border-l border-t border-border sm:grid-cols-3">
              {["w-16", "w-14", "w-20", "w-16", "w-20", "w-14"].map((width, index) => (
                <div key={index} className="border-b border-r border-border p-3">
                  <Line className={`h-2.5 ${width}`} />
                  <Line className="mt-3 h-4 w-20" />
                </div>
              ))}
            </div>
            <section className="mt-8 grid gap-3 border-y border-border py-6 sm:grid-cols-[7rem_1fr]">
              <Line className="h-3 w-16" />
              <div className="space-y-2">
                <Line className="h-3 w-full" />
                <Line className="h-3 w-[92%]" />
                <Line className="h-3 w-[68%]" />
              </div>
            </section>
          </div>
        </article>

        <section className="mx-auto mt-12 max-w-5xl">
          <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-foreground pb-4">
            <div><Line className="h-3 w-36" /><Line className="mt-3 h-9 w-48" /></div>
            <Line className="hidden h-8 w-44 sm:block" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => <Line key={item} className="h-16 w-full" />)}
          </div>
        </section>
      </main>
    </div>
  )
}
