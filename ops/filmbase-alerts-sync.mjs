const secret = process.env.FILMBASE_ALERTS_SYNC_SECRET
if (!secret) throw new Error('FILMBASE_ALERTS_SYNC_SECRET is required')
const port = process.env.PORT || '3000'
const response = await fetch(`http://127.0.0.1:${port}/api/v1/alerts/sync`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(240000),
})
const body = await response.text()
if (!response.ok) throw new Error(`Alert sync returned ${response.status}: ${body}`)
console.log(body)
