"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

const CHANNEL_URL = "https://whatsapp.com/channel/0029VbA7fQJ0Qeaco8Wcx81K"
const SITE_URL = "https://filmbase.top"
const DISMISSED_KEY = "filmbase-domain-move-notice-dismissed"

export function WhatsAppNotice() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISSED_KEY) === "true") return
    } catch {
      // Show the pop-up when browser storage is disabled.
    }
    setOpen(true)
  }, [])

  const changeOpen = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) return
    try {
      window.sessionStorage.setItem(DISMISSED_KEY, "true")
    } catch {
      // Closing still works for the current page.
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="whatsapp-popup" showCloseButton={false}>
        <DialogTitle>FilmBase has a new home</DialogTitle>
        <DialogDescription>
          FilmBase is moving from <strong translate="no">filmbase.fun</strong> to <strong translate="no">filmbase.top</strong>.
          {" "}Please update your bookmarks and use the new address.
        </DialogDescription>
        <div className="whatsapp-popup-actions">
          <a href={SITE_URL} onClick={() => changeOpen(false)}>
            Visit filmbase.top <span aria-hidden="true">↗</span>
          </a>
          <DialogClose type="button">Keep browsing</DialogClose>
        </div>
        <p className="whatsapp-popup-follow">
          Stay in the loop: <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" onClick={() => changeOpen(false)}>follow FilmBase on WhatsApp</a>.
        </p>
      </DialogContent>
    </Dialog>
  )
}
