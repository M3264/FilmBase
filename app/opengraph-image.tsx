import { ImageResponse } from "next/og"

export const alt = "FilmBase movie archive"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#11110f", color: "#f5f0e7", padding: 72, fontFamily: "sans-serif", position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", borderTop: "3px solid #ffb22f", borderBottom: "1px solid #6e6b63", padding: "42px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}><div style={{ display: "flex", width: 74, height: 74, background: "#ffb22f", color: "#11110f", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900 }}>FB</div><span style={{ fontSize: 28 }}>Neighbourhood archive</span></div>
        <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 104, fontWeight: 900, lineHeight: 0.9 }}>FilmBase</span><span style={{ marginTop: 26, fontSize: 30, color: "#b9b4aa" }}>Movies, series and anime. Ad-free.</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#b9b4aa" }}><span>POSTER-LED CATALOGUE</span><span>FILMBASE.FUN</span></div>
      </div>
    </div>,
    size,
  )
}
