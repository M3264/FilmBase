import { Skeleton } from "@/components/ui/skeleton"

export function CatalogLoading({ title = true }: { title?: boolean }) {
  return <div className="min-h-screen" aria-busy="true" aria-live="polite">
    <p className="sr-only">Loading FilmBase catalogue</p>
    <main className="site-shell pb-16 pt-24 sm:pt-28">
      {title ? <header className="mb-8 grid gap-7 border-y border-border py-8 md:grid-cols-[minmax(0,1fr)_17rem] md:items-end"><div><Skeleton className="h-3 w-40 rounded-none" /><Skeleton className="mt-5 h-20 w-[min(100%,34rem)] rounded-none sm:h-28" /></div><div className="border-l-4 border-border pl-4"><Skeleton className="h-3 w-20 rounded-none" /><Skeleton className="mt-4 h-10 w-full rounded-none" /></div></header> : null}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{Array.from({ length: 12 }, (_, index) => <div key={index}><Skeleton className="aspect-[2/3] w-full rounded-none" /><Skeleton className="mt-3 h-3 w-4/5 rounded-none" /><Skeleton className="mt-2 h-2.5 w-2/5 rounded-none" /><Skeleton className="mt-3 h-7 w-3/5 rounded-none" /></div>)}</div>
    </main>
  </div>
}
