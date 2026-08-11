"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Download, X } from "lucide-react"

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaRegister() {
  const pathname = usePathname()
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const adFreeStream = pathname === "/movie/local-spider-man-brand-new-day-2026"
    // Keep one root-scoped worker: /sw.js is also required by FilmBase's
    // publisher integration, and a second worker would replace it.
    if ("serviceWorker" in navigator) {
      if (adFreeStream) {
        navigator.serviceWorker.getRegistrations().then((registrations) => registrations.forEach((registration) => registration.unregister())).catch(() => undefined)
      } else {
        navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined)
      }
    }
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as InstallPromptEvent)
      if (localStorage.getItem("filmbase-install-dismissed") !== "1") setVisible(true)
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall)
  }, [pathname])

  if (!visible || !installEvent) return null

  const install = async () => {
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === "accepted") setVisible(false)
    setInstallEvent(null)
  }

  const dismiss = () => {
    localStorage.setItem("filmbase-install-dismissed", "1")
    setVisible(false)
  }

  return <aside className="pwa-install" role="dialog" aria-label="Install FilmBase">
    <div className="pwa-install-mark">FB</div>
    <div className="pwa-install-copy"><b>Take the archive with you.</b><span>Install FilmBase like an app.</span></div>
    <button className="pwa-install-action" onClick={install}><Download size={15} /> Install</button>
    <button className="pwa-install-close" onClick={dismiss} aria-label="Dismiss install prompt"><X size={15} /></button>
  </aside>
}
