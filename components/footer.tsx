export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-2xl font-bold tracking-tight mb-2">
              FilmBase<span className="text-primary">.</span>
            </p>
            <p className="text-sm text-muted-foreground">Your ultimate destination for movies and series</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              Created by <span className="text-foreground font-medium">Kenny</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
               {new Date().getFullYear()} FilmBase. No copyright acclaimed.
            </p>
          </div>
          <!-- Add inside the footer container, after the copyright section -->
          <div className="mt-8 pt-8 border-t border-border">
            <div id="container-aadc53e5aa579316a6819840d149ca4b"></div>
            <Script 
             async
             data-cfasync="false"
              src="https://pl28996783.profitablecpmratenetwork.com/aadc53e5aa579316a6819840d149ca4b/invoke.js"
    strategy="afterInteractive"
          />
          </div>
        </div>
      </div>
    </footer>
  )
}
