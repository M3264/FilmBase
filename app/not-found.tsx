import { getNavLinks } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Film } from "lucide-react"

export default async function NotFound() {
  const navLinks = await getNavLinks()

  return (
    <div className="min-h-screen flex flex-col">
      <Header navLinks={navLinks} />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Film className="h-16 w-16 text-primary" />
            </div>
          </div>

          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>

          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button size="lg">Go Home</Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline">
                Search Movies
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
