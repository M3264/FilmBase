import Link from "next/link"

export type BreadcrumbEntry = { name: string; href?: string }

export function SeoBreadcrumbs({ items }: { items: BreadcrumbEntry[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 overflow-x-auto">
      <ol className="flex min-w-max items-center gap-2 data-type text-[10px] uppercase text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? <Link href={item.href} className="py-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{item.name}</Link> : <span aria-current="page" className="max-w-[42vw] truncate py-2 text-foreground">{item.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function breadcrumbSchema(items: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: new URL(item.href, "https://filmbase.fun").toString() } : {}),
    })),
  }
}
