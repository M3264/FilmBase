import type { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { getNavLinks } from "@/lib/api"
import { JsonLd } from "@/components/json-ld"
import { SeoBreadcrumbs, breadcrumbSchema } from "@/components/seo-breadcrumbs"

export const metadata: Metadata = { title: "Help and FAQ", description: "Answers about FilmBase streams, downloads, artwork, and broken-link reports.", alternates: { canonical: "/help" } }
const questions = [
  ["Is FilmBase free of ads?", "Yes. FilmBase does not run pop-ups, injected publisher scripts, or advertising interruptions."],
  ["Why does a download open an external host?", "FilmBase lists explicit source offers. The named host delivers the file, while FilmBase keeps the title and source metadata clear."],
  ["Why is a poster missing?", "Some provider feeds arrive before their artwork. Refreshing later usually fills the poster from the title detail or artwork feed."],
  ["Can I stream every title?", "Streaming is available only where FilmBase has a verified stream. Download offers remain separate and may be available for other titles."],
  ["How do I report a broken file?", "Send the title URL, source host, and the error you saw through the FilmBase request desk. Reports are reviewed during the next catalogue pass."],
] as const

export default async function HelpPage() {
  const navLinks = await getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] }))
  const crumbs = [{ name: "Home", href: "/" }, { name: "Help and FAQ" }]
  return <div className="min-h-screen"><Header navLinks={navLinks} /><main className="site-shell pb-16 pt-24 sm:pt-28"><SeoBreadcrumbs items={crumbs} /><JsonLd data={[breadcrumbSchema(crumbs), { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }]} /><header className="border-y border-border py-9"><p className="eyebrow text-primary">FilmBase desk notes</p><h1 className="mt-3 text-[clamp(3rem,10vw,7rem)] font-black leading-[.82] tracking-[-.07em]">Help the<br />archive.</h1><p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground">Short answers for finding, watching, downloading, and reporting catalogue problems.</p></header><section className="mt-10 border-l border-t border-border" aria-labelledby="faq-heading"><h2 id="faq-heading" className="sr-only">Frequently asked questions</h2>{questions.map(([question, answer], index) => <details id={question.startsWith("How do I report") ? "broken-files" : undefined} key={question} className="group border-b border-r border-border"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-base font-bold hover:bg-secondary sm:px-7"><span><span className="mr-4 font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>{question}</span><span className="text-2xl font-normal group-open:rotate-45">+</span></summary><p className="max-w-3xl border-t border-dashed border-border px-5 py-5 text-sm leading-7 text-muted-foreground sm:pl-16">{answer}</p></details>)}</section><div className="mt-10 flex flex-wrap gap-5 text-sm font-semibold"><Link href="/search" className="border-b-2 border-foreground pb-1">Open the request desk ↗</Link><Link href="/discover" className="border-b-2 border-foreground pb-1">Browse the archive ↗</Link></div></main><Footer /></div>
}
