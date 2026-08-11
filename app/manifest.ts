import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FilmBase — Neighbourhood archive",
    short_name: "FilmBase",
    description: "A poster-led archive of films, series and anime.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait-primary",
    background_color: "#09131e",
    theme_color: "#ffb22f",
    lang: "en",
    categories: ["entertainment", "movies", "books"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  }
}
