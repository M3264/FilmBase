import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const today = new Date().toISOString().slice(0, 10)
const previous = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
const title = (id, name) => ({ id: `ninejarocks:${id}`, title: name, type: 'movie', imageUrl: null, providers: [{ provider: 'ninejarocks', id: String(id) }] })
let feed = [title(1, 'First Film (2026)')]
let failFeed = false
const upstream = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json')
  const url = new URL(request.url, 'http://localhost')
  if (url.pathname === '/v1/catalog') {
    if (failFeed) { response.statusCode = 503; response.end('{}'); return }
    response.end(JSON.stringify({ data: feed })); return
  }
  if (url.pathname === '/discover/movie') {
    const theatrical = url.searchParams.get('with_release_type') === '2|3'
    response.end(JSON.stringify({ results: theatrical ? [
      { id: 101, title: 'Theatrical Film', poster_path: '/theatrical.jpg' },
      { id: 103, title: 'Older Theatrical Film', poster_path: null },
    ] : [{ id: 102, title: 'Digital Film', poster_path: null }] })); return
  }
  const match = url.pathname.match(/^\/movie\/(\d+)\/release_dates$/)
  if (match) {
    const id = Number(match[1])
    response.end(JSON.stringify({ results: [{ release_dates: [{ type: id === 102 ? 4 : 3, release_date: `${id === 103 ? previous : today}T00:00:00.000Z` }] }] })); return
  }
  response.statusCode = 404; response.end('{}')
})
await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve))
const upstreamPort = upstream.address().port
const dir = await mkdtemp(join(tmpdir(), 'filmbase-alerts-test-'))
const base = 'http://127.0.0.1:3341'
let child
function start(mode = 'server') {
  child = spawn('node', [mode === 'runner' ? 'ops/filmbase-alerts-runner.mjs' : '.next/standalone/server.js'], { cwd: process.cwd(), env: {
    ...process.env, PORT: '3341', HOSTNAME: '127.0.0.1', FILMBASE_ALERTS_FILE: join(dir, 'state.json'),
    FILMBASE_ALERTS_SYNC_SECRET: 'test-secret', FILMBASE_SERVER_PATH: join(process.cwd(), '.next/standalone/server.js'), FILMBASE_API2_URL: `http://127.0.0.1:${upstreamPort}`,
    FILMBASE_TMDB_API_URL: `http://127.0.0.1:${upstreamPort}`, TMDB_API_READ_TOKEN: 'test-token',
  }, stdio: 'ignore' })
}
async function ready() {
  for (let i = 0; i < 100; i++) {
    try { const response = await fetch(`${base}/api/v1/alerts`); if (response.ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Next server did not start')
}
async function stop() { if (child && child.exitCode === null) { child.kill('SIGTERM'); await new Promise(resolve => child.once('exit', resolve)) } }
async function sync() { const response = await fetch(`${base}/api/v1/alerts/sync`, { method: 'POST', headers: { Authorization: 'Bearer test-secret' } }); return { status: response.status, body: await response.json() } }
async function get(path) { const response = await fetch(base + path); return { status: response.status, body: await response.json() } }
try {
  start(); await ready()
  assert.equal((await get('/api/v1/picks/random')).status, 503)
  assert.equal((await fetch(`${base}/api/v1/alerts/sync`, { method: 'POST' })).status, 401)
  failFeed = true
  const failedFirst = await sync()
  assert.equal(failedFirst.status, 502)
  assert.equal(failedFirst.body.tmdb, 2)
  failFeed = false
  const first = await sync()
  assert.equal(first.status, 200)
  assert.equal(first.body.filmbase, 0)
  assert.equal(first.body.tmdb, 0)
  const initial = (await get('/api/v1/alerts')).body
  assert.deepEqual(initial.events.map(event => event.kind), ['tmdb_theatrical', 'tmdb_digital'])
  assert(initial.events.every(event => !event.availableOnFilmBase && event.url.startsWith('https://www.themoviedb.org/')))
  const pick = (await get('/api/v1/picks/daily')).body
  assert.equal(pick.date, today)
  assert.match(pick.pick.url, /^https:\/\/filmbase\.top\/movie\/fb-1$/)
  assert.equal((await get('/api/v1/picks/random')).body.contentType, 'movie')
  assert.equal((await sync()).body.cursor, first.body.cursor)
  feed = [title(3, 'Third Film (2026)'), title(2, 'Example Series Season 1'), ...feed]
  const second = await sync()
  assert.equal(second.body.filmbase, 2)
  const newer = (await get(`/api/v1/alerts?after=${first.body.cursor}&limit=1`)).body
  assert.equal(newer.events.length, 1)
  assert.equal(newer.hasMore, true)
  assert.equal(newer.events[0].contentType, 'series')
  assert.equal((await get('/api/v1/picks/daily')).body.pick.url, pick.pick.url)
  const stream = await fetch(`${base}/api/v1/alerts/stream`, { headers: { 'Last-Event-ID': first.body.cursor } })
  assert.equal(stream.status, 200)
  const reader = stream.body.getReader()
  let streamed = ''
  for (let i = 0; i < 3 && !streamed.includes('event: alert'); i++) streamed += new TextDecoder().decode((await reader.read()).value)
  assert.match(streamed, /event: alert/)
  await reader.cancel()
  failFeed = true
  assert.equal((await sync()).status, 502)
  assert.equal((await get('/api/v1/alerts')).body.events.length, 4)
  failFeed = false
  await stop(); start(); await ready()
  assert.equal((await sync()).body.filmbase, 0)
  assert.equal((await get('/api/v1/alerts')).body.events.length, 4)
  const persisted = JSON.parse(await readFile(join(dir, 'state.json'), 'utf8'))
  assert.equal(persisted.events.length, 4)
  await stop()
  await rm(join(dir, 'state.json'))
  start('runner'); await ready()
  for (let i = 0; i < 50; i++) {
    if ((await get('/api/v1/picks/daily')).status === 200) break
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert.equal((await get('/api/v1/picks/daily')).status, 200)
  console.log('alerts integration passed')
} finally {
  await stop()
  upstream.close()
  await rm(dir, { recursive: true, force: true })
}
