import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const requests = []
let healthy = true
const title = 'Unified Film (2026)'
const upstream = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost')
  requests.push(url.pathname + url.search)
  response.setHeader('Content-Type', 'application/json')
  if (url.pathname === '/v1/health') {
    response.statusCode = healthy ? 200 : 503
    response.end(JSON.stringify({ data: { status: healthy ? 'ok' : 'degraded', database: healthy ? 'ok' : 'error' } }))
  } else if (url.pathname === '/api/search' && url.searchParams.has('query')) {
    response.end(JSON.stringify({ success: true, data: { listTitle: title, currentPage: 1, totalPages: 1, items: [{ title, path: 'unified-film/', imageUrl: '/wp-content/uploads/nkiri.jpg' }] } }))
  } else if (url.pathname === '/api/search' && url.searchParams.has('q')) {
    response.end(JSON.stringify({ movies: [{ id: '999999', title, url: '/videodownload/unified-film-id999999.html', thumbnail: 'https://9jarocks.net/wp-content/uploads/nineja.jpg' }] }))
  } else if (url.pathname.startsWith('/api/movie/')) {
    response.end(JSON.stringify({ title, description: 'A unified movie.', thumbnail: 'https://9jarocks.net/wp-content/uploads/nineja.jpg', download_links: [{ url: 'https://loadedfiles.net/unified-film.mkv', label: 'Download' }] }))
  } else { response.statusCode = 404; response.end('{}') }
})
await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve))
const apiUrl = `http://127.0.0.1:${upstream.address().port}`
const dir = await mkdtemp(join(tmpdir(), 'filmbase-unified-ui-'))
const base = 'http://127.0.0.1:3342'
const child = spawn('node', ['.next/standalone/server.js'], {
  cwd: process.cwd(), stdio: 'ignore', env: {
    ...process.env, HOSTNAME: '127.0.0.1', PORT: '3342', FILMBASE_API_URL: apiUrl,
    FILMBASE_API2_URL: 'http://127.0.0.1:1', FILMBASE_LEGACY_API_URL: 'http://127.0.0.1:1',
    FILMBASE_ALERTS_FILE: join(dir, 'alerts.json'), TMDB_API_READ_TOKEN: '', TMDB_API_KEY: '',
  },
})
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${base}/api/v1/health`)).ok) { ready = true; break } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert.ok(ready, 'Next server started')
  let health = await (await fetch(`${base}/api/v1/health`)).json()
  assert.equal(health.data.apiUrl, apiUrl)
  assert.equal(health.data.status, 'available')
  assert.equal(health.data.providers.length, 2)
  const response = await fetch(`${base}/api/v1/search?q=Unified`)
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.data.length, 1, 'matching titles from both sources are merged')
  assert.equal(body.data[0].sourceCount, 2)
  assert.equal(body.data[0].imageUrl, 'https://thenkiri.ng/wp-content/uploads/nkiri.jpg')
  assert.ok(requests.some(path => path.startsWith('/api/search?query=Unified')))
  assert.ok(requests.includes('/api/search?q=Unified'))
  assert.ok(requests.includes('/v1/health'))
  assert.ok(!requests.includes('/'), 'health probes the database-aware route')
  healthy = false
  health = await (await fetch(`${base}/api/v1/health`)).json()
  assert.equal(health.data.status, 'unavailable')
  assert.ok(health.data.providers.every(provider => !provider.ok))
  console.log('Unified movie API integration passed: one upstream, both sources, merged titles, poster identity, degraded health.')
} finally {
  if (child.exitCode === null) { child.kill('SIGTERM'); await new Promise(resolve => child.once('exit', resolve)) }
  await new Promise(resolve => upstream.close(resolve))
  await rm(dir, { recursive: true, force: true })
}
