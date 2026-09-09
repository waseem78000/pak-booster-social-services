export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return res.status(200).end()
  }

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const path = url.pathname.replace(/^\/api/, '')

    if (path === '/health') {
      return res.status(200).json({ ok: true, runtime: 'vercel-node' })
    }

    if (path === '/test-db') {
      const { createClient } = await import('@libsql/client')
      const db = createClient({
        url: process.env.DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      })
      const result = await db.execute('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name')
      return res.status(200).json({ ok: true, tables: result.rows.map((r: any) => r.name) })
    }

    return res.status(404).json({ error: 'Not found', path })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
