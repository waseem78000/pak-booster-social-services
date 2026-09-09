import app from '../server'

export const config = {
  api: false,
}

export default async function handler(req: any, res: any) {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const method = req.method || 'GET'

    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (value && typeof value === 'string') {
        headers.set(key, value)
      }
    }

    let body: any = undefined
    if (method !== 'GET' && method !== 'HEAD') {
      const chunks: Buffer[] = []
      for await (const chunk of req) chunks.push(Buffer.from(chunk))
      body = Buffer.concat(chunks)
    }

    const request = new Request(url.toString(), { method, headers, body })
    const response = await app.fetch(request)

    res.writeHead(response.status, Object.fromEntries(response.headers.entries()))
    
    if (response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }
    res.end()
  } catch (err: any) {
    console.error('API Error:', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }))
  }
}
