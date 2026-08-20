import { getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs"

export default async function NotFound() {
  const navLinks = await getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] }))

  return (
    <div className="min-h-screen flex flex-col">
      <Header navLinks={navLinks} />

      <main className="site-shell flex-1 pb-16 pt-24 sm:pt-28">
        <SeoBreadcrumbs items={[{ name: "Home", href: "/" }, { name: "Missing page" }]} />
        <div className="border-y border-border py-12 sm:py-20">
          <p className="eyebrow text-primary">Archive slip / 404</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(3.2rem,11vw,8rem)] font-black leading-[.78] tracking-[-.07em]">This shelf<br />is empty.</h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">The title or page may have moved. Search the catalogue or return to the front desk and keep browsing.</p>
          <div className="mt-8 flex flex-wrap gap-5 text-sm font-bold"><Link href="/" className="border-2 border-foreground px-5 py-3 hover:bg-foreground hover:text-background">Front desk ↗</Link><Link href="/search" className="border-b-2 border-foreground px-1 py-3">Search the archive ↗</Link></div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
