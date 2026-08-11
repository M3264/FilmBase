import Link from "next/link"

export function TransmissionStrip({ genres }: { genres: Array<{ name: string; path: string }> }) {
  const items = genres.slice(0, 10)
  if (!items.length) return null
  return (
    <div className="transmission" aria-label="FilmBase live catalogue updates">
      <div className="transmission-label"><span /> Live from the archive</div>
      <div className="transmission-window">
        <div className="transmission-track">
          {[...items, ...items].map((genre, index) => (
            <Link href={`/${genre.path}`} key={`${genre.path}-${index}`}><b>{String((index % items.length) + 1).padStart(2, "0")}</b>{genre.name}<span>✦</span></Link>
          ))}
        </div>
      </div>
    </div>
  )
}
