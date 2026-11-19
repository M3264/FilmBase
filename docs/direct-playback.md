# Direct playback

FilmBase shows **Watch now** next to eligible existing LoadedFiles offers. Each file/episode keeps its own **Download file** action. Opening the player fetches the original file through `/api/watch?path=<catalogue-reference>&offer=<index>`; browsing a title does not prefetch movie bytes.

The watch route accepts catalogue references, not arbitrary media URLs. It checks the selected offer's HTTPS host and extension, delegates resolution to the existing allowlisted download backend, forwards single byte ranges, and returns the response inline. Media is streamed without saving or transcoding it. Closing the player releases its media connection; the download backend must propagate client cancellation through its resolver and stream requests.

## Supported attempts and limitations

- MP4/M4V, WebM and MKV offers can be attempted. Container support alone does not guarantee codec support.
- Native browser controls provide play/pause, seeking, volume and fullscreen where available. Playback does not auto-start with sound.
- Unsupported video codecs, audio-only decoding, unavailable hosts and loading failures show a retry/download fallback. Quality remains whatever the selected original offer provides.
- No new adaptive qualities, transcoding, extracted subtitles or persistent resume feature are added in this version.
- A metadata-only player may remain paused without being treated as a playback failure. A separate watchdog handles an actual stalled playback attempt.
- The existing dedicated local-title player is unchanged.

## Verification

Run the existing gates:

```sh
npm run typecheck
npm run lint
npm run build
node tests/unified-api-integration.mjs
node tests/alerts-integration.mjs
```

The additional **live-source** integration check needs a running instance and the selected catalogue offer to remain available. It reads only small byte ranges, rather than downloading the movie:

```sh
FILMBASE_TEST_URL=http://127.0.0.1:3000 node --test tests/direct-playback-integration.mjs
```

Before release, also exercise the native player in a real browser: compatible video frames and seeking; unsupported-codec fallback; paused metadata after 30 seconds; close/retry behavior; no media requests before opening a player; and 360px, 768px and 1440px layouts in both themes. Mobile emulation is not proof of Safari/iOS codec compatibility.
