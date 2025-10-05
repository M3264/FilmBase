"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { resolveDownloadLink } from "@/lib/api"

function parseDownloadText(text: string): string {
  const s0eMatch = text.match(/S(\d+)E(\d+)/i)
  const seasonEpisodeMatch = text.match(/Season\s*(\d+)\s*Episode\s*(\d+)/i)
  const episodeSeasonMatch = text.match(/Episode\s*(\d+)\s*Season\s*(\d+)/i)
  const episodeMatch = text.match(/Episode\s*(\d+)/i)
  const seasonMatch = text.match(/Season\s*(\d+)/i)
  const epMatch = text.match(/\bEp\.?\s*(\d+)/i)
  const numberOnlyMatch = text.match(/^(\d+)$/)

  if (s0eMatch) {
    return `Download S${s0eMatch[1].padStart(2, "0")}E${s0eMatch[2].padStart(2, "0")}`
  }

  if (seasonEpisodeMatch) {
    return `Download S${seasonEpisodeMatch[1].padStart(2, "0")}E${seasonEpisodeMatch[2].padStart(2, "0")}`
  }

  if (episodeSeasonMatch) {
    return `Download S${episodeSeasonMatch[2].padStart(2, "0")}E${episodeSeasonMatch[1].padStart(2, "0")}`
  }

  if (episodeMatch && seasonMatch) {
    return `Download S${seasonMatch[1].padStart(2, "0")}E${episodeMatch[1].padStart(2, "0")}`
  }

  if (episodeMatch) {
    return `Download Episode ${episodeMatch[1]}`
  }

  if (epMatch) {
    return `Download Episode ${epMatch[1]}`
  }

  if (seasonMatch) {
    return `Download Season ${seasonMatch[1]}`
  }

  if (numberOnlyMatch) {
    return `Download Episode ${numberOnlyMatch[1]}`
  }

  return text.includes("Download") ? text : `Download ${text}`
}

export function DownloadButton({ intermediateUrl, text }: { intermediateUrl: string; text: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const displayText = parseDownloadText(text)

  const handleDownload = async () => {
    try {
      setIsLoading(true)
      setDownloadProgress(0)

      let directLink = intermediateUrl
      let fileName = "download"

      if (intermediateUrl.startsWith("https://downloadwella.com/")) {
        setDownloadProgress(15)

        const progressStages = [
          { progress: 30, delay: 400 },
          { progress: 45, delay: 300 },
          { progress: 60, delay: 500 },
          { progress: 75, delay: 400 },
          { progress: 90, delay: 300 },
        ]

        let currentStage = 0
        const updateProgress = () => {
          if (currentStage < progressStages.length) {
            setDownloadProgress(progressStages[currentStage].progress)
            currentStage++

            if (currentStage < progressStages.length) {
              setTimeout(updateProgress, progressStages[currentStage - 1].delay)
            }
          }
        }

        updateProgress()

        const result = await resolveDownloadLink(intermediateUrl)

        if (result.success && result.directLink) {
          directLink = result.directLink
          fileName = result.fileInfo?.fileName || "download"
        } else {
          setDownloadProgress(0)
          setIsLoading(false)
          return
        }
      } else {
        setDownloadProgress(90)
      }

      setDownloadProgress(100)

      const link = document.createElement("a")
      link.href = directLink
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => {
        setIsLoading(false)
        setDownloadProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Download error:", error)
      setIsLoading(false)
      setDownloadProgress(0)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleDownload} disabled={isLoading} className="w-full md:w-auto gap-2">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Resolving...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            {displayText}
          </>
        )}
      </Button>
      {isLoading && downloadProgress > 0 && <Progress value={downloadProgress} className="w-full md:w-64" />}
    </div>
  )
}
