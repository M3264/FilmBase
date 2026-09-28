import { eventsAfter, readAlerts } from "@/lib/server/alerts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const after = request.headers.get("last-event-id") || new URL(request.url).searchParams.get("after")
  let state
  try {
    state = await readAlerts()
    eventsAfter(state, after, 100)
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 })
  }
  if (after && state.events.length && Number(after) < Number(state.events[0].id) - 1) return Response.json({ error: "cursor has expired", retainedSince: state.events[0].id }, { status: 410 })
  const encoder = new TextEncoder()
  let cursor = after
  let timer: ReturnType<typeof setInterval> | undefined
  let busy = false
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(": connected\n\n"))
      const poll = async () => {
        if (busy || request.signal.aborted) return
        busy = true
        try {
          const data = eventsAfter(await readAlerts(), cursor, 100)
          for (const event of data.events) {
            controller.enqueue(encoder.encode(`id: ${event.id}\nevent: alert\ndata: ${JSON.stringify(event)}\n\n`))
            cursor = event.id
          }
          controller.enqueue(encoder.encode(": keepalive\n\n"))
        } catch { controller.enqueue(encoder.encode(": temporary read error\n\n")) }
        finally { busy = false }
      }
      void poll()
      timer = setInterval(() => { void poll() }, 15000)
      request.signal.addEventListener("abort", () => { if (timer) clearInterval(timer); try { controller.close() } catch {} }, { once: true })
    },
    cancel() { if (timer) clearInterval(timer) },
  })
  return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } })
}
