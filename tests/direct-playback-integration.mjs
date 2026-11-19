import assert from "node:assert/strict"
import test from "node:test"

const base = process.env.FILMBASE_TEST_URL || "http://127.0.0.1:3310"
const samplePath = "fb-419951"

for (const query of ["", "path=x&offer=-1", "path=x&offer=1.5", "path=x&offer=oops", "path=https://127.0.0.1/&offer=0"]) {
  test(`rejects invalid playback request: ${query || "empty"}`, async () => {
    const response = await fetch(`${base}/api/watch?${query}`)
    await response.body?.cancel()
    assert.equal(response.status, 400)
  })
}

test("unknown catalogue offer cannot become an arbitrary URL proxy", async () => {
  const query = new URLSearchParams({ path: samplePath, offer: "99999" })
  const response = await fetch(`${base}/api/watch?${query}`)
  await response.body?.cancel()
  assert.equal(response.status, 404)
})

test("supports suffix byte ranges for players that request the file tail", async () => {
  const query = new URLSearchParams({ path: samplePath, offer: "0" })
  const response = await fetch(`${base}/api/watch?${query}`, { headers: { Range: "bytes=-16" }, signal: AbortSignal.timeout(90000) })
  const bytes = new Uint8Array(await response.arrayBuffer())
  assert.equal(response.status, 206)
  assert.equal(bytes.length, 16)
  const match = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(response.headers.get("content-range") || "")
  assert.ok(match)
  assert.equal(Number(match[2]), Number(match[3]) - 1)
  assert.equal(Number(match[1]), Number(match[3]) - 16)
})

test("clamps a bounded range past EOF without advertising nonexistent bytes", async () => {
  const query = new URLSearchParams({ path: samplePath, offer: "0" })
  const probe = await fetch(`${base}/api/watch?${query}`, { headers: { Range: "bytes=0-0" }, signal: AbortSignal.timeout(90000) })
  const total = Number((probe.headers.get("content-range") || "").split("/")[1])
  await probe.arrayBuffer()
  assert.ok(total > 16)
  const response = await fetch(`${base}/api/watch?${query}`, { headers: { Range: `bytes=${total - 8}-${total + 100}` }, signal: AbortSignal.timeout(90000) })
  const bytes = await response.arrayBuffer()
  assert.equal(response.status, 206)
  assert.equal(response.headers.get("content-range"), `bytes ${total - 8}-${total - 1}/${total}`)
  assert.equal(bytes.byteLength, 8)
})

for (const range of ["bytes=-0", "bytes=5-2", "bytes=0-1,4-5", "bytes=wat", "bytes=-"]) {
  test(`rejects unsupported range: ${range}`, async () => {
    const query = new URLSearchParams({ path: samplePath, offer: "0" })
    const response = await fetch(`${base}/api/watch?${query}`, { headers: { Range: range } })
    await response.body?.cancel()
    assert.equal(response.status, 416)
  })
}

test("streams an existing download inline and preserves the real byte range", async () => {
  const query = new URLSearchParams({ path: samplePath, offer: "0" })
  const response = await fetch(`${base}/api/watch?${query}`, { headers: { Range: "bytes=0-1023" }, signal: AbortSignal.timeout(90000) })
  const bytes = new Uint8Array(await response.arrayBuffer())
  assert.equal(response.status, 206)
  assert.match(response.headers.get("content-type") || "", /^video\/x-matroska/)
  assert.equal(response.headers.get("content-disposition"), "inline")
  assert.match(response.headers.get("content-range") || "", /^bytes 0-1023\/\d+$/)
  assert.equal(bytes.length, 1024)
  assert.deepEqual([...bytes.slice(0, 4)], [0x1a, 0x45, 0xdf, 0xa3])
  assert.equal(response.headers.get("cache-control"), "private, no-store")
})
