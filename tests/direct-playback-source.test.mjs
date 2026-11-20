import assert from "node:assert/strict"
import test from "node:test"
import { directPlaybackSource, directWatchUrl } from "../lib/providers/direct-playback.ts"

test("eligible existing files keep their native media type", () => {
  for (const [extension, type] of [["mp4", "video/mp4"], ["m4v", "video/mp4"], ["mkv", "video/x-matroska"], ["webm", "video/webm"]]) {
    assert.equal(directPlaybackSource(`https://loadedfiles.net/id/movie.${extension}`)?.contentType, type)
  }
  assert.ok(directPlaybackSource("https://cdn.loadedfiles.net/id/movie.MP4?token=abc"))
})

test("untrusted destinations and non-video files do not receive Watch now", () => {
  for (const url of ["not a url", "http://loadedfiles.net/id/movie.mp4", "https://evilloadedfiles.net/movie.mp4", "https://loadedfiles.net.evil.test/movie.mp4", "https://user:pass@loadedfiles.net/movie.mp4", "https://127.0.0.1/movie.mp4", "https://loadedfiles.net/movie.zip", "https://loadedfiles.net/movie.html"]) {
    assert.equal(directPlaybackSource(url), null, url)
    assert.equal(directWatchUrl("fb-1", url, 0), undefined, url)
  }
})

test("Downloadwella episode landing pages are eligible and require resolution", () => {
  const page = "https://downloadwella.com/ixz11jxlau53/The.Body.S01E01.(THENKIRI.COM).mkv.html"
  const source = directPlaybackSource(page)
  assert.ok(source)
  assert.equal(source.contentType, "video/x-matroska")
  assert.equal(source.requiresResolution, true)
  assert.ok(directWatchUrl("the-body-s01-tv-series/", page, 0))
  assert.equal(directPlaybackSource("https://dwbe02.downloadwella.com/d/token/The.Body.S01E01.mkv")?.requiresResolution, false)
  assert.equal(directPlaybackSource("https://downloadwella.com/advertisement.html"), null)
  assert.equal(directPlaybackSource("https://downloadwella.com.evil.test/episode.mkv.html"), null)
})

test("bare LoadedFiles links without a file extension are eligible; type is learned at watch time", () => {
  const source = directPlaybackSource("https://loadedfiles.net/bec88e2b980c6d01")
  assert.ok(source)
  assert.equal(source.contentType, null)
  assert.equal(source.requiresResolution, false)
  assert.ok(directWatchUrl("fb-171656", "https://loadedfiles.net/bec88e2b980c6d01", 0))
  assert.equal(directPlaybackSource("https://loadedfiles.net/movie.zip"), null)
})

test("watch links contain only a catalogue reference and offer selection", () => {
  const url = directWatchUrl("fb-419951", "https://loadedfiles.net/id/movie.mkv", 2)
  const parsed = new URL(url, "https://filmbase.top")
  assert.equal(parsed.pathname, "/api/watch")
  assert.deepEqual(Object.fromEntries(parsed.searchParams), { path: "fb-419951", offer: "2" })
  assert.ok(!url.includes("loadedfiles.net"))
})
