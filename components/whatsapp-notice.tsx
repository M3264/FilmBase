"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

const CHANNEL_URL = "https://whatsapp.com/channel/0029VbA7fQJ0Qeaco8Wcx81K"
const DISMISSED_KEY = "filmbase-whatsapp-notice-dismissed"

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
        <span className="eyebrow">From the archive desk</span>
        <DialogTitle>Follow FilmBase on WhatsApp</DialogTitle>
        <DialogDescription>Get FilmBase updates in our WhatsApp channel.</DialogDescription>
        <div className="whatsapp-popup-actions">
          <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" onClick={() => changeOpen(false)}>
            Follow the channel <span aria-hidden="true">↗</span>
          </a>
          <DialogClose type="button">Maybe later</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
