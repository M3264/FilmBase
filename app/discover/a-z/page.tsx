import type { Metadata } from "next"
import Link from "next/link"
import { getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
export const metadata: Metadata = { title: "A–Z archive", alternates: { canonical: "/discover/a-z" } }
export default async function AlphabetPage() { const navLinks = await getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] })); return <div className="min-h-screen"><Header navLinks={navLinks} /><main className="site-shell pb-16 pt-24 sm:pt-28"><header className="border-y border-border py-8"><p className="eyebrow text-primary">FilmBase paper index</p><h1 className="mt-3 text-[clamp(3.5rem,12vw,9rem)] font-black leading-[.78] tracking-[-.07em]">A–Z archive</h1><p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">Pick the first letter. We will pull every matching spine from the catalogue.</p></header><div className="my-10 grid grid-cols-4 border-l border-t border-border sm:grid-cols-7 lg:grid-cols-13">{"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => <Link key={letter} href={`/discover/a-z/${letter.toLowerCase()}`} className="grid aspect-square place-items-center border-b border-r border-border text-2xl font-black hover:bg-primary hover:text-primary-foreground">{letter}</Link>)}</div></main><Footer /></div> }
