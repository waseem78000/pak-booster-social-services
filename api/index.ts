import type { IncomingMessage, ServerResponse } from 'http'
import { createClient } from '@libsql/client'

export const config = { api: false }

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

const JWT_SECRET = process.env.JWT_SECRET || 'pak-booster-secret-2026'

function json(res: ServerResponse, data: any, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' })
  res.end(JSON.stringify(data))
}

function error(res: ServerResponse, msg: string, status = 400) { json(res, { error: msg }, status) }

function getToken(req: IncomingMessage): string | null {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())) }
      catch { resolve({}) }
    })
  })
}

function verifyAdmin(token: string): any {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    if (payload.role === 'admin' || payload.username === 'admin') return payload
    return null
  } catch { return null }
}

function verifyUser(token: string): any {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload
  } catch { return null }
}

function adminId(): string { return 'admin-001' }

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' })
    return res.end()
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const path = url.pathname.replace(/^\/api/, '')
  const method = req.method || 'GET'

  try {
    // --- HEALTH ---
    if (path === '/health' && method === 'GET') return json(res, { ok: true })

    // --- SITE SETTINGS ---
    if (path === '/site-settings' && method === 'GET') {
      const r = await db.execute('SELECT * FROM site_settings LIMIT 1')
      const s = r.rows[0]
      return json(res, { settings: s ? {
        siteName: s.site_name, siteTagline: s.site_tagline, adminName: s.admin_name,
        adminPhone: s.admin_phone, adminEmail: s.admin_email, adminWhatsapp: s.admin_whatsapp,
        instagram: s.instagram, youtube: s.youtube, facebook: s.facebook, twitter: s.twitter, telegram: s.telegram
      } : { siteName: 'PAK BOOSTER' } })
    }

    // --- AUTH REGISTER ---
    if (path === '/auth/register' && method === 'POST') {
      const body = await parseBody(req)
      const { email, username, password, name } = body
      if (!email || !username || !password) return error(res, 'Missing fields')
      const bcrypt = await import('bcryptjs')
      const hash = await bcrypt.hash(password, 12)
      const id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
      try {
        await db.execute({ sql: 'INSERT INTO users (id, email, username, name, password_hash, wallet_balance, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)', args: [id, email, username, name || '', hash, 'active', new Date().toISOString(), new Date().toISOString()] })
        const token = `eyJ${btoa(JSON.stringify({ id, email, username, role: 'user' }))}.sig`
        return json(res, { token, user: { id, email, username, name } })
      } catch (e: any) {
        if (e.message?.includes('UNIQUE')) return error(res, 'Email or username already exists')
        throw e
      }
    }

    // --- AUTH LOGIN ---
    if (path === '/auth/login' && method === 'POST') {
      const body = await parseBody(req)
      const { email, password } = body
      if (!email || !password) return error(res, 'Missing fields')
      const r = await db.execute({ sql: 'SELECT * FROM users WHERE email = ? OR username = ?', args: [email, email] })
      const user = r.rows[0]
      if (!user) return error(res, 'Invalid credentials', 401)
      const bcrypt = await import('bcryptjs')
      const valid = await bcrypt.compare(password, user.password_hash as string)
      if (!valid) return error(res, 'Invalid credentials', 401)
      const token = `eyJ${btoa(JSON.stringify({ id: user.id, email: user.email, username: user.username, role: 'user' }))}.sig`
      return json(res, { token, user: { id: user.id, email: user.email, username: user.username, name: user.name } })
    }

    // --- AUTH ME ---
    if (path === '/auth/me' && method === 'GET') {
      const t = getToken(req)
      if (!t) return error(res, 'No token', 401)
      const p = verifyUser(t)
      if (!p) return error(res, 'Invalid token', 401)
      const r = await db.execute({ sql: 'SELECT id, email, username, name, wallet_balance, status FROM users WHERE id = ?', args: [p.id] })
      if (!r.rows[0]) return error(res, 'User not found', 404)
      return json(res, { user: r.rows[0] })
    }

    // --- ADMIN LOGIN ---
    if (path === '/admin/login' && method === 'POST') {
      const body = await parseBody(req)
      let adminCreds = { username: 'admin', password: 'admin123', email: 'seemi78000@gmail.com' }
      const token = `eyJ${btoa(JSON.stringify({ id: adminId(), username: adminCreds.username, role: 'admin' }))}.sig`
      return json(res, { token, admin: { username: adminCreds.username, role: 'admin' } })
    }

    // --- ADMIN ME ---
    if (path === '/admin/me' && method === 'GET') {
      const t = getToken(req)
      if (!t) return error(res, 'No token', 401)
      const p = verifyAdmin(t)
      if (!p) return error(res, 'Not admin', 403)
      return json(res, { admin: { id: adminId(), username: p.username || 'admin', role: 'admin' } })
    }

    // --- ADMIN DASHBOARD ---
    if (path === '/admin/dashboard' && method === 'GET') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const [users, deps, orders, revenue, wallet] = await Promise.all([
        db.execute('SELECT COUNT(*) as c FROM users'),
        db.execute("SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as total, SUM(CASE WHEN status='pending' THEN amount ELSE 0 END) as pending, SUM(CASE WHEN status='approved' THEN amount ELSE 0 END) as approved, SUM(CASE WHEN status='rejected' THEN amount ELSE 0 END) as rejected FROM deposits"),
        db.execute("SELECT COUNT(*) as c, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status='processing' THEN 1 ELSE 0 END) as processing, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM orders"),
        db.execute("SELECT COALESCE(SUM(amount),0) as total FROM orders WHERE status='completed'"),
        db.execute("SELECT COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE 0 END),0) as credits, COALESCE(SUM(CASE WHEN type='debit' THEN amount ELSE 0 END),0) as debits FROM wallet_transactions"),
      ])
      const d = (r: any) => r.rows[0]
      return json(res, {
        totalUsers: Number(d(users).c), totalDeposits: Number(d(deps).total), pendingDeposits: Number(d(deps).pending),
        approvedDeposits: Number(d(deps).approved), rejectedDeposits: Number(d(deps).rejected || 0),
        totalOrders: Number(d(orders).c), pendingOrders: Number(d(orders).pending || 0),
        processingOrders: Number(d(orders).processing || 0), completedOrders: Number(d(orders).completed || 0),
        totalRevenue: Number(d(revenue).total), walletActivity: Number(d(wallet).credits) - Number(d(wallet).debits),
        dbConnected: true,
      })
    }

    // --- SERVICES ---
    if (path === '/services' && method === 'GET') {
      const r = await db.execute("SELECT * FROM services WHERE status='active' ORDER BY category, name")
      return json(res, { services: r.rows })
    }

    // --- ADMIN SERVICES ---
    if (path === '/admin/services' && method === 'GET') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const r = await db.execute('SELECT * FROM services ORDER BY category, name')
      return json(res, { services: r.rows })
    }
    if (path === '/admin/services' && method === 'POST') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const body = await parseBody(req)
      const id = 's_' + Date.now()
      await db.execute({ sql: 'INSERT INTO services (id, name, category, description, price, min_quantity, max_quantity, avg_start_time, speed, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)', args: [id, body.name, body.category, body.description || '', body.price, body.minQuantity || 100, body.maxQuantity || 100000, body.avgStartTime || '', body.speed || '', body.status || 'active', new Date().toISOString()] })
      return json(res, { ok: true, id })
    }
    if (path.startsWith('/admin/services/') && method === 'PUT') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const id = path.split('/').pop()
      const body = await parseBody(req)
      await db.execute({ sql: 'UPDATE services SET name=?, category=?, description=?, price=?, min_quantity=?, max_quantity=?, avg_start_time=?, speed=?, status=? WHERE id=?', args: [body.name, body.category, body.description || '', body.price, body.minQuantity || 100, body.maxQuantity || 100000, body.avgStartTime || '', body.speed || '', body.status || 'active', id] })
      return json(res, { ok: true })
    }
    if (path.startsWith('/admin/services/') && method === 'DELETE') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const id = path.split('/').pop()
      await db.execute({ sql: 'DELETE FROM services WHERE id=?', args: [id] })
      return json(res, { ok: true })
    }

    // --- DEPOSITS ---
    if (path === '/deposits' && method === 'GET') {
      const t = getToken(req)
      if (!t) return error(res, 'Auth required', 401)
      const p = verifyUser(t)
      if (!p) return error(res, 'Invalid token', 401)
      const r = await db.execute({ sql: "SELECT * FROM deposits WHERE user_id=? ORDER BY created_at DESC", args: [p.id] })
      return json(res, { deposits: r.rows })
    }
    if (path === '/deposits' && method === 'POST') {
      const t = getToken(req)
      if (!t) return error(res, 'Auth required', 401)
      const p = verifyUser(t)
      if (!p) return error(res, 'Invalid token', 401)
      const body = await parseBody(req)
      const id = 'dep_' + Date.now()
      await db.execute({ sql: 'INSERT INTO deposits (id, user_id, amount, method, transaction_id, sender_info, screenshot, status, created_at) VALUES (?,?,?,?,?,?,?,?,?)', args: [id, p.id, body.amount, body.method, body.transactionId || '', body.senderInfo || '', body.screenshot || null, 'pending', new Date().toISOString()] })
      return json(res, { ok: true, id })
    }

    // --- ADMIN DEPOSITS ---
    if (path === '/admin/deposits' && method === 'GET') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const r = await db.execute('SELECT d.*, u.username FROM deposits d LEFT JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC')
      return json(res, { deposits: r.rows })
    }
    if (path.match(/^\/admin\/deposits\/[^/]+\/approve$/) && method === 'POST') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const id = path.split('/')[3]
      await db.execute({ sql: "UPDATE deposits SET status='approved', reviewed_by=?, reviewed_at=? WHERE id=?", args: ['admin', new Date().toISOString(), id] })
      const dep = (await db.execute({ sql: 'SELECT * FROM deposits WHERE id=?', args: [id] })).rows[0]
      if (dep) {
        await db.execute({ sql: 'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id=?', args: [dep.amount, dep.user_id] })
        const u = (await db.execute({ sql: 'SELECT wallet_balance FROM users WHERE id=?', args: [dep.user_id] })).rows[0]
        await db.execute({ sql: 'INSERT INTO wallet_transactions (id, user_id, type, amount, previous_balance, new_balance, description, deposit_id, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)', args: ['wt_' + Date.now(), dep.user_id, 'credit', dep.amount, (u?.wallet_balance as number) - (dep.amount as number), u?.wallet_balance, 'Deposit approved', id, 'completed', new Date().toISOString()] })
      }
      return json(res, { ok: true })
    }
    if (path.match(/^\/admin\/deposits\/[^/]+\/reject$/) && method === 'POST') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const id = path.split('/')[3]
      await db.execute({ sql: "UPDATE deposits SET status='rejected', reviewed_by=?, reviewed_at=? WHERE id=?", args: ['admin', new Date().toISOString(), id] })
      return json(res, { ok: true })
    }

    // --- ORDERS ---
    if (path === '/orders' && method === 'GET') {
      const t = getToken(req)
      if (!t) return error(res, 'Auth required', 401)
      const p = verifyUser(t)
      if (!p) return error(res, 'Invalid token', 401)
      const r = await db.execute({ sql: "SELECT o.*, s.name as service_name, s.category as service_category FROM orders o LEFT JOIN services s ON o.service_id = s.id WHERE o.user_id=? ORDER BY o.created_at DESC", args: [p.id] })
      return json(res, { orders: r.rows })
    }
    if (path === '/orders' && method === 'POST') {
      const t = getToken(req)
      if (!t) return error(res, 'Auth required', 401)
      const p = verifyUser(t)
      if (!p) return error(res, 'Invalid token', 401)
      const body = await parseBody(req)
      const svc = (await db.execute({ sql: 'SELECT * FROM services WHERE id=?', args: [body.serviceId] })).rows[0]
      if (!svc) return error(res, 'Service not found')
      const amount = (svc.price as number) * (body.quantity / 1000)
      const u = (await db.execute({ sql: 'SELECT wallet_balance FROM users WHERE id=?', args: [p.id] })).rows[0]
      if ((u?.wallet_balance as number) < amount) return error(res, 'Insufficient balance')
      const id = 'ord_' + Date.now()
      await db.execute({ sql: 'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id=?', args: [amount, p.id] })
      await db.execute({ sql: 'INSERT INTO orders (id, user_id, service_id, link, quantity, amount, status, created_at) VALUES (?,?,?,?,?,?,?,?)', args: [id, p.id, body.serviceId, body.link, body.quantity, amount, 'pending', new Date().toISOString()] })
      return json(res, { ok: true, id })
    }

    // --- ADMIN ORDERS ---
    if (path === '/admin/orders' && method === 'GET') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const r = await db.execute('SELECT o.*, u.username, u.email, s.name as service_name FROM orders o LEFT JOIN users u ON o.user_id = u.id LEFT JOIN services s ON o.service_id = s.id ORDER BY o.created_at DESC')
      return json(res, { orders: r.rows })
    }
    if (path.match(/^\/admin\/orders\/[^/]+\/(start|complete|cancel)$/) && method === 'POST') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const parts = path.split('/')
      const id = parts[3], action = parts[4]
      const statusMap: Record<string, string> = { start: 'processing', complete: 'completed', cancel: 'cancelled' }
      await db.execute({ sql: 'UPDATE orders SET status=? WHERE id=?', args: [statusMap[action] || action, id] })
      return json(res, { ok: true })
    }

    // --- WALLET TRANSACTIONS ---
    if (path === '/wallet-transactions' && method === 'GET') {
      const t = getToken(req)
      if (!t) return error(res, 'Auth required', 401)
      const p = verifyUser(t)
      if (!p) return error(res, 'Invalid token', 401)
      const r = await db.execute({ sql: 'SELECT * FROM wallet_transactions WHERE user_id=? ORDER BY created_at DESC', args: [p.id] })
      return json(res, { transactions: r.rows })
    }
    if (path === '/admin/wallet-transactions' && method === 'GET') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const r = await db.execute('SELECT wt.*, u.username FROM wallet_transactions wt LEFT JOIN users u ON wt.user_id = u.id ORDER BY wt.created_at DESC')
      return json(res, { transactions: r.rows })
    }

    // --- NOTIFICATIONS ---
    if (path === '/notifications' && method === 'GET') {
      const t = getToken(req)
      if (!t) return error(res, 'Auth required', 401)
      const p = verifyUser(t)
      if (!p) return error(res, 'Invalid token', 401)
      const r = await db.execute({ sql: 'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC', args: [p.id] })
      return json(res, { notifications: r.rows })
    }
    if (path.match(/^\/notifications\/[^/]+\/read$/) && method === 'PUT') {
      const t = getToken(req)
      if (!t) return error(res, 'Auth required', 401)
      const id = path.split('/')[2]
      await db.execute({ sql: 'UPDATE notifications SET read_status=1 WHERE id=?', args: [id] })
      return json(res, { ok: true })
    }
    if (path === '/notifications/read-all' && method === 'POST') {
      const t = getToken(req)
      if (!t) return error(res, 'Auth required', 401)
      const p = verifyUser(t)
      if (!p) return error(res, 'Invalid token', 401)
      await db.execute({ sql: 'UPDATE notifications SET read_status=1 WHERE user_id=?', args: [p.id] })
      return json(res, { ok: true })
    }

    // --- SUPPORT TICKETS ---
    if (path === '/support-tickets' && method === 'GET') {
      const t = getToken(req)
      if (!t) return error(res, 'Auth required', 401)
      const p = verifyUser(t)
      if (!p) return error(res, 'Invalid token', 401)
      const r = await db.execute({ sql: 'SELECT * FROM support_tickets WHERE user_id=? ORDER BY created_at DESC', args: [p.id] })
      return json(res, { tickets: r.rows })
    }
    if (path === '/support-tickets' && method === 'POST') {
      const t = getToken(req)
      if (!t) return error(res, 'Auth required', 401)
      const p = verifyUser(t)
      if (!p) return error(res, 'Invalid token', 401)
      const body = await parseBody(req)
      const id = 'tkt_' + Date.now()
      await db.execute({ sql: 'INSERT INTO support_tickets (id, user_id, subject, message, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)', args: [id, p.id, body.subject, body.message, 'open', new Date().toISOString(), new Date().toISOString()] })
      return json(res, { ok: true, id })
    }

    // --- ADMIN SUPPORT TICKETS ---
    if (path === '/admin/support-tickets' && method === 'GET') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const r = await db.execute('SELECT t.*, u.username FROM support_tickets t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC')
      return json(res, { tickets: r.rows })
    }
    if (path.match(/^\/admin\/support-tickets\/[^/]+\/reply$/) && method === 'POST') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const id = path.split('/')[3]
      const body = await parseBody(req)
      await db.execute({ sql: "UPDATE support_tickets SET reply=?, status='replied', updated_at=? WHERE id=?", args: [body.reply, new Date().toISOString(), id] })
      return json(res, { ok: true })
    }

    // --- PLANS ---
    if (path === '/plans' && method === 'GET') {
      const r = await db.execute("SELECT * FROM plans WHERE status='active' ORDER BY platform, price")
      return json(res, { plans: r.rows })
    }
    if (path === '/admin/plans' && method === 'GET') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const r = await db.execute('SELECT * FROM plans ORDER BY platform, price')
      return json(res, { plans: r.rows })
    }
    if (path === '/admin/plans' && method === 'POST') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const body = await parseBody(req)
      const id = 'plan_' + Date.now()
      await db.execute({ sql: 'INSERT INTO plans (id, name, description, platform, price, duration, views, subscribers, features, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)', args: [id, body.name, body.description || '', body.platform, body.price, body.duration, body.views || 0, body.subscribers || 0, body.features || '', body.status || 'active', new Date().toISOString()] })
      return json(res, { ok: true, id })
    }

    // --- ADMIN USERS ---
    if (path === '/admin/users' && method === 'GET') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const r = await db.execute('SELECT id, email, username, name, wallet_balance, status, created_at FROM users ORDER BY created_at DESC')
      return json(res, { users: r.rows })
    }
    if (path.match(/^\/admin\/users\/[^/]+$/) && method === 'GET') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const id = path.split('/').pop()
      const r = await db.execute({ sql: 'SELECT id, email, username, name, wallet_balance, status, created_at FROM users WHERE id=?', args: [id] })
      return json(res, { user: r.rows[0] || null })
    }
    if (path.match(/^\/admin\/users\/[^/]+$/) && method === 'PUT') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const id = path.split('/').pop()
      const body = await parseBody(req)
      if (body.status) await db.execute({ sql: 'UPDATE users SET status=? WHERE id=?', args: [body.status, id] })
      return json(res, { ok: true })
    }
    if (path.match(/^\/admin\/users\/[^/]+\/adjust-balance$/) && method === 'POST') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const id = path.split('/')[3]
      const body = await parseBody(req)
      const u = (await db.execute({ sql: 'SELECT wallet_balance FROM users WHERE id=?', args: [id] })).rows[0]
      if (!u) return error(res, 'User not found', 404)
      const prev = Number(u.wallet_balance)
      const newBal = body.type === 'credit' ? prev + Number(body.amount) : prev - Number(body.amount)
      await db.execute({ sql: 'UPDATE users SET wallet_balance=? WHERE id=?', args: [newBal, id] })
      await db.execute({ sql: 'INSERT INTO wallet_transactions (id, user_id, type, amount, previous_balance, new_balance, description, status, created_at) VALUES (?,?,?,?,?,?,?,?,?)', args: ['wt_' + Date.now(), id, body.type, body.amount, prev, newBal, body.description || 'Admin adjustment', 'completed', new Date().toISOString()] })
      return json(res, { ok: true, newBalance: newBal })
    }

    // --- ADMIN PAYMENT SETTINGS ---
    if (path === '/payment-settings' && method === 'GET') {
      const r = await db.execute('SELECT * FROM payment_settings LIMIT 1')
      return json(res, { settings: r.rows[0] || {} })
    }
    if (path === '/admin/payment-settings' && method === 'PUT') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const body = await parseBody(req)
      const existing = (await db.execute('SELECT id FROM payment_settings LIMIT 1')).rows[0]
      if (existing) {
        await db.execute({ sql: 'UPDATE payment_settings SET jazzcash_enabled=?, jazzcash_number=?, jazzcash_title=?, easypaisa_enabled=?, easypaisa_number=?, easypaisa_title=?, qr_enabled=?, qr_title=?, updated_at=? WHERE id=?', args: [body.jazzcashEnabled ? 1 : 0, body.jazzcashNumber, body.jazzcashTitle, body.easypaisaEnabled ? 1 : 0, body.easypaisaNumber, body.easypaisaTitle, body.qrEnabled ? 1 : 0, body.qrTitle, new Date().toISOString(), existing.id] })
      }
      return json(res, { ok: true })
    }

    // --- ADMIN SITE SETTINGS ---
    if (path === '/admin/site-settings' && method === 'PUT') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const body = await parseBody(req)
      const existing = (await db.execute('SELECT id FROM site_settings LIMIT 1')).rows[0]
      if (existing) {
        await db.execute({ sql: 'UPDATE site_settings SET site_name=?, site_tagline=?, admin_name=?, admin_phone=?, admin_email=?, admin_whatsapp=?, instagram=?, youtube=?, facebook=?, twitter=?, telegram=?, updated_at=? WHERE id=?', args: [body.siteName || 'PAK BOOSTER', body.siteTagline || 'Social Services', body.adminName, body.adminPhone, body.adminEmail, body.adminWhatsapp, body.instagram || '', body.youtube || '', body.facebook || '', body.twitter || '', body.telegram || '', new Date().toISOString(), existing.id] })
      } else {
        await db.execute({ sql: 'INSERT INTO site_settings (id, site_name, site_tagline, admin_name, admin_phone, admin_email, admin_whatsapp, instagram, youtube, facebook, twitter, telegram, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', args: ['ss-001', body.siteName || 'PAK BOOSTER', body.siteTagline || 'Social Services', body.adminName, body.adminPhone, body.adminEmail, body.adminWhatsapp, body.instagram || '', body.youtube || '', body.facebook || '', body.twitter || '', body.telegram || '', new Date().toISOString()] })
      }
      return json(res, { ok: true })
    }

    // --- ADMIN CHANGE CREDENTIALS ---
    if (path === '/admin/change-credentials' && method === 'PUT') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      return json(res, { ok: true, message: 'Credentials updated (stored in localStorage)' })
    }

    // --- ADMIN BACKUP EXPORT ---
    if (path === '/admin/backup/export' && method === 'GET') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const [users, admins, services, deposits, orders, walletTx, notifications, tickets, plans, userPlans, ps, ss] = await Promise.all([
        db.execute('SELECT * FROM users'), db.execute('SELECT * FROM admin_users'), db.execute('SELECT * FROM services'),
        db.execute('SELECT * FROM deposits'), db.execute('SELECT * FROM orders'), db.execute('SELECT * FROM wallet_transactions'),
        db.execute('SELECT * FROM notifications'), db.execute('SELECT * FROM support_tickets'), db.execute('SELECT * FROM plans'),
        db.execute('SELECT * FROM user_plans'), db.execute('SELECT * FROM payment_settings'), db.execute('SELECT * FROM site_settings'),
      ])
      return json(res, { users: users.rows, adminUsers: admins.rows, services: services.rows, deposits: deposits.rows, orders: orders.rows, walletTransactions: walletTx.rows, notifications: notifications.rows, supportTickets: tickets.rows, plans: plans.rows, userPlans: userPlans.rows, paymentSettings: ps.rows, siteSettings: ss.rows })
    }

    // --- ADMIN BACKUP IMPORT ---
    if (path === '/admin/backup/import' && method === 'POST') {
      const t = getToken(req)
      if (!t || !verifyAdmin(t)) return error(res, 'Not admin', 403)
      const body = await parseBody(req)
      let imported = 0
      const tables = ['notifications', 'wallet_transactions', 'orders', 'deposits', 'user_plans', 'support_tickets', 'users', 'admin_users', 'services', 'plans', 'payment_settings', 'site_settings']
      const keys: Record<string, string> = { users: 'users', adminUsers: 'admin_users', services: 'services', deposits: 'deposits', orders: 'orders', walletTransactions: 'wallet_transactions', notifications: 'notifications', supportTickets: 'support_tickets', plans: 'plans', userPlans: 'user_plans', paymentSettings: 'payment_settings', siteSettings: 'site_settings' }
      for (const key of Object.keys(keys)) {
        const data = body[key]
        if (Array.isArray(data)) {
          await db.execute({ sql: `DELETE FROM "${keys[key]}"`, args: [] })
          for (const row of data) {
            try {
              const cols = Object.keys(row).map(k => `"${k}"`).join(', ')
              const placeholders = Object.keys(row).map(() => '?').join(', ')
              await db.execute({ sql: `INSERT INTO "${keys[key]}" (${cols}) VALUES (${placeholders})`, args: Object.values(row) })
              imported++
            } catch {}
          }
        }
      }
      return json(res, { ok: true, imported })
    }

    // --- 404 ---
    error(res, `Not found: ${method} ${path}`, 404)

  } catch (err: any) {
    console.error(`API Error [${method} ${path}]:`, err.message)
    error(res, err.message || 'Internal server error', 500)
  }
}
