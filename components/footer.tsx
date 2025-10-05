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
              © {new Date().getFullYear()} FilmBase. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
