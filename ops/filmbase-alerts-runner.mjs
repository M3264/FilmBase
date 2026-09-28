import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'

const secret = process.env.FILMBASE_ALERTS_SYNC_SECRET || randomBytes(32).toString('hex')
const port = process.env.PORT || '3000'
const serverPath = process.env.FILMBASE_SERVER_PATH || '/app/server.js'
const server = spawn(process.execPath, [serverPath], {
  env: { ...process.env, FILMBASE_ALERTS_SYNC_SECRET: secret },
  stdio: 'inherit',
})

let timer
let stopping = false
const sync = async () => {
  if (stopping) return
  let retryMs = 5 * 60 * 1000
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/v1/alerts/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(240000),
    })
    const result = await response.json()
    if (!response.ok) console.error('FilmBase alert sync reported errors:', result)
    else console.log('FilmBase alert sync:', result)
  } catch (error) {
    console.error('FilmBase alert sync could not connect:', error.message)
    retryMs = 10000
  }
  timer = setTimeout(sync, retryMs)
}

server.on('exit', (code, signal) => {
  stopping = true
  if (timer) clearTimeout(timer)
  process.exit(stopping ? 0 : (code ?? (signal ? 1 : 0)))
})
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    stopping = true
    if (timer) clearTimeout(timer)
    server.kill(signal)
  })
}
timer = setTimeout(sync, 1000)
