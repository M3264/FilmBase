"use client"

import { useState } from "react"

export function WrongTrailerButton({ path, title, videoId }: { path: string; title: string; videoId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle")

  if (state === "done") {
    return <span className="text-xs font-bold text-muted-foreground">Noted, thanks. We will review this trailer.</span>
  }

  return (
    <button
      type="button"
      disabled={state === "sending"}
      onClick={async () => {
        setState("sending")
        try {
          await fetch("/api/v1/trailer-reports", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ path, title, videoId }),
          })
        } catch {
          /* report is best-effort; still acknowledge */
        }
        setState("done")
      }}
      className="text-xs font-bold text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
    >
      {state === "sending" ? "Sending…" : "Wrong trailer?"}
    </button>
  )
}
