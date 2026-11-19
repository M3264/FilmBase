# Playback

FilmBase shows **Watch now** next to eligible existing LoadedFiles offers. Each file/episode keeps its own **Download file** action. Opening the player fetches the original file through `/api/watch?path=<catalogue-reference>&offer=<index>`; browsing a title does not prefetch movie bytes.

The watch route accepts catalogue references, not arbitrary media URLs. Provider eligibility is shared by the page and route. Direct playback forwards single byte ranges and returns the original media inline. Closing the player releases its connection; backend cancellation reaches resolution and upstream requests.

## Compatible streaming

If the original file cannot display video, **Play compatible stream** opts into server-side H.264/AAC conversion. No conversion runs just because a page loads or a direct player is opened.

- The frontend requests `mode=compatible` with a per-player UUID session and a `start` time in seconds. `/api/watch` resolves the catalogue offer, then proxies the fixed backend `/api/compatible-file` endpoint. It does not forward byte Range headers into a freshly encoded stream.
- The backend feature is gated by `FILMBASE_COMPATIBLE_ENABLED=true` and needs FFmpeg with libx264/AAC. Without the worker enabled, direct playback and downloads are still available.
- Compatible output is fragmented MP4 streamed over a pipe. Converted movies and HLS segments are not stored on disk. Buffers, CPU and network resources are still required.
- One conversion is allowed at a time. Another session receives 503 with Retry-After; it is not silently queued. This is not a multi-viewer streaming platform.
- The player has explicit play/pause, volume and fullscreen controls. ±30 seconds and the **Jump to / Seek** controls restart the same conversion session at a time offset, rather than pretending byte seeking works on freshly generated output. The original file's duration is used when available; otherwise an explicit minutes input still permits time-based seeking.
- Seeking or retrying can have startup delay. The proxy briefly retries busy responses while a previous same-session process exits. A failed compatible stream offers retry from the last observed position and retains Download. Closing or replacing a player cancels its request; the worker also expires after two minutes without downstream consumption.
- HEAD on the watch endpoint returns 405 and cannot start conversion. The proxy preserves busy responses, rejects invalid session/start/mode inputs and streams compatible output without fabricating Content-Length/Content-Range.

## Supported attempts and limitations

- MP4/M4V, WebM and MKV offers can be attempted. Container support alone does not establish codec support.
- Original files use native controls and do not auto-start with sound. Compatible playback is requested explicitly and may begin after preparation; browser autoplay restrictions can still require pressing Play.
- Quality remains that of the selected original offer for direct playback. Compatible conversion is a resource-capped rendition, not an adaptive quality ladder.
- No extracted subtitle tracks or cross-session watch-history/resume store are added. The existing dedicated local-title player is unchanged.
- A metadata-only direct player may remain paused without a false failure. Compatible preparation and actual playback waits have separate bounded loading deadlines.
- A short sample converting faster than playback does not prove every full movie or concurrent load will work. Report real-source tests separately from generated fixtures and test the actual VPS.

## Verification

```sh
npm run typecheck
npm run lint
npm run build
node tests/unified-api-integration.mjs
node tests/alerts-integration.mjs
node tests/compatible-proxy-integration.mjs
```

The proxy test uses a deliberately controlled upstream response to verify routing and headers, not to claim real video playback. Source-eligibility unit tests require Node 22+:

```sh
node --experimental-strip-types --test tests/direct-playback-source.test.mjs
```

The **live-source** direct-playback integration check reads tiny ranges and requires the selected catalogue offer to remain available:

```sh
FILMBASE_TEST_URL=http://127.0.0.1:3000 node --test tests/direct-playback-integration.mjs
```

Browser checks: decoded frames/currentTime for real compatible output; native and compatible seeking; explicit opt-in; source/busy errors; close/retry; paused metadata past 30 seconds; no conversion before user action; and 360px/768px/1440px in both themes. Test a second session while the first is active and verify FFmpeg exits after close. Mobile Chromium emulation is not proof of iOS/Safari compatibility.
