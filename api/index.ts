import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@libsql/client'
import crypto from 'crypto'

let db: any = null

function getDb() {
  if (db) return db
  db = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })
  return db
}

function json(res: VercelResponse, status: number, data: any) {
  res.setHeader('Content-Type', 'application/json')
  return res.status(status).json(data)
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

function verifyToken(req: VercelRequest): any {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const token = auth.slice(7)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch { return null }
}

function verifyAdmin(req: VercelRequest): any {
  const u = verifyToken(req)
  if (!u || u.role !== 'admin') return null
  return u
}

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}

function makeToken(payload: any) {
  const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const b = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const s = crypto.createHmac('sha256', process.env.JWT_SECRET || 'pak-booster-secret-2026').update(`${h}.${b}`).digest('base64url')
  return `${h}.${b}.${s}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    let path = url.pathname.replace(/^\/api/, '')
    const method = req.method

    // ============ HEALTH ============
    if (path === '/health' || path === '') {
      return json(res, 200, { ok: true, runtime: 'vercel-standalone' })
    }

    // ============ AUTH LOGIN ============
    if (path === '/auth/login' && method === 'POST') {
      const { username, password } = req.body || {}
      if (!username || !password) return json(res, 400, { error: 'Required' })

      const db = getDb()

      // Check admin
      const adm = await db.execute({ sql: `SELECT * FROM admin_users WHERE username = ? OR email = ?`, args: [username, username] })
      if (adm.rows.length > 0) {
        const a = adm.rows[0]
        if ((a.password_hash || '') === password) {
          const token = makeToken({ id: a.id, username: a.username, email: a.email, role: 'admin', exp: Math.floor(Date.now() / 1000) + 86400 * 365 })
          return json(res, 200, { ok: true, token, user: { id: a.id, username: a.username, email: a.email, role: 'admin' } })
        }
        return json(res, 401, { error: 'Invalid password' })
      }

      // Check user by email
      const usr = await db.execute({ sql: `SELECT * FROM users WHERE email = ?`, args: [username] })
      if (usr.rows.length > 0) {
        const u = usr.rows[0]
        if ((u.password_hash || '') === password) {
          const token = makeToken({ id: u.id, email: u.email, name: u.name, role: 'user', exp: Math.floor(Date.now() / 1000) + 86400 * 365 })
          return json(res, 200, { ok: true, token, user: { id: u.id, email: u.email, name: u.name, role: 'user' } })
        }
        return json(res, 401, { error: 'Invalid password' })
      }

      return json(res, 401, { error: 'User not found' })
    }

    // ============ AUTH REGISTER ============
    if (path === '/auth/register' && method === 'POST') {
      const { email, password, name, phone } = req.body || {}
      if (!email || !password || !name) return json(res, 400, { error: 'Email, password, name required' })

      const db = getDb()
      const ex = await db.execute({ sql: `SELECT id FROM users WHERE email = ?`, args: [email] })
      if (ex.rows.length > 0) return json(res, 409, { error: 'Email already registered' })

      const id = genId()
      await db.execute({
        sql: `INSERT INTO users (id, email, name, password_hash, wallet_balance, status, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 'active', datetime('now'), datetime('now'))`,
        args: [id, email, name, password]
      })
      const token = makeToken({ id, email, name, role: 'user', exp: Math.floor(Date.now() / 1000) + 86400 * 365 })
      return json(res, 201, { ok: true, token, user: { id, email, name, role: 'user' } })
    }

    // ============ ADMIN DASHBOARD ============
    if (path === '/admin/dashboard') {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })

      const db = getDb()
      const [users, deposits, orders, services, plans, userPlans, walletTxns] = await Promise.all([
        db.execute(`SELECT COUNT(*) as c FROM users`),
        db.execute(`SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as total FROM deposits`),
        db.execute(`SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as total FROM orders`),
        db.execute(`SELECT COUNT(*) as c FROM services`),
        db.execute(`SELECT COUNT(*) as c FROM plans`),
        db.execute(`SELECT COUNT(*) as c FROM user_plans`),
        db.execute(`SELECT COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE 0 END),0) as credits, COALESCE(SUM(CASE WHEN type='debit' THEN amount ELSE 0 END),0) as debits FROM wallet_transactions`),
      ])

      const pd = await db.execute(`SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as total FROM deposits WHERE status='pending'`)
      const ad = await db.execute(`SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as total FROM deposits WHERE status='approved'`)
      const rd = await db.execute(`SELECT COALESCE(SUM(amount),0) as total FROM deposits WHERE status='rejected'`)
      const po = await db.execute(`SELECT COUNT(*) as c FROM orders WHERE status='pending'`)
      const pr = await db.execute(`SELECT COUNT(*) as c FROM orders WHERE status='processing'`)
      const co = await db.execute(`SELECT COUNT(*) as c FROM orders WHERE status='completed'`)
      const pt = await db.execute(`SELECT COUNT(*) as c FROM support_tickets WHERE status='open'`)

      return json(res, 200, {
        totalUsers: users.rows[0]?.c || 0,
        totalDeposits: deposits.rows[0]?.total || 0,
        totalOrders: orders.rows[0]?.c || 0,
        totalRevenue: orders.rows[0]?.total || 0,
        totalServices: services.rows[0]?.c || 0,
        totalPlans: plans.rows[0]?.c || 0,
        activeSubscriptions: userPlans.rows[0]?.c || 0,
        pendingDeposits: pd.rows[0]?.total || 0,
        approvedDeposits: ad.rows[0]?.total || 0,
        rejectedDeposits: rd.rows[0]?.total || 0,
        pendingOrders: po.rows[0]?.c || 0,
        processingOrders: pr.rows[0]?.c || 0,
        completedOrders: co.rows[0]?.c || 0,
        pendingTickets: pt.rows[0]?.c || 0,
        walletActivity: (walletTxns.rows[0]?.credits || 0) - (walletTxns.rows[0]?.debits || 0),
      })
    }

    // ============ ADMIN CHANGE CREDENTIALS ============
    if (path === '/admin/change-credentials' && method === 'POST') {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })

      const { currentPassword, newUsername, newPassword, newEmail } = req.body || {}
      const db = getDb()
      const r = await db.execute({ sql: `SELECT * FROM admin_users WHERE id = ?`, args: [admin.id] })
      if (r.rows.length === 0) return json(res, 404, { error: 'Admin not found' })

      const cur = r.rows[0]
      if ((cur.password_hash || '') !== currentPassword) return json(res, 401, { error: 'Wrong current password' })

      const sets: string[] = []
      const args: any[] = []
      if (newUsername) { sets.push('username = ?'); args.push(newUsername) }
      if (newPassword) { sets.push('password_hash = ?'); args.push(newPassword) }
      if (newEmail) { sets.push('email = ?'); args.push(newEmail) }
      args.push(admin.id)
      if (sets.length > 0) await db.execute({ sql: `UPDATE admin_users SET ${sets.join(', ')} WHERE id = ?`, args })

      const token = makeToken({ id: admin.id, username: newUsername || cur.username, email: newEmail || cur.email, role: 'admin', exp: Math.floor(Date.now() / 1000) + 86400 * 365 })
      return json(res, 200, { ok: true, token, message: 'Credentials updated' })
    }

    // ============ SITE SETTINGS ============
    if (path === '/site-settings' && method === 'GET') {
      const db = getDb()
      const r = await db.execute(`SELECT * FROM site_settings LIMIT 1`)
      return json(res, 200, { settings: r.rows.length > 0 ? r.rows[0] : null })
    }

    if (path === '/site-settings' && method === 'PUT') {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })

      const db = getDb()
      const body = req.body || {}
      const sets: string[] = []
      const args: any[] = []
      const fields: Record<string, string> = {
        admin_name: 'admin_name', admin_phone: 'admin_phone', admin_email: 'admin_email',
        admin_whatsapp: 'admin_whatsapp', instagram: 'instagram', youtube: 'youtube',
        facebook: 'facebook', twitter: 'twitter', telegram: 'telegram'
      }
      // Also accept short names from frontend
      if (body.admin_name !== undefined) { sets.push('admin_name = ?'); args.push(body.admin_name) }
      if (body.admin_phone !== undefined) { sets.push('admin_phone = ?'); args.push(body.admin_phone) }
      if (body.admin_email !== undefined) { sets.push('admin_email = ?'); args.push(body.admin_email) }
      if (body.admin_whatsapp !== undefined) { sets.push('admin_whatsapp = ?'); args.push(body.admin_whatsapp) }
      if (body.instagram !== undefined) { sets.push('instagram = ?'); args.push(body.instagram) }
      if (body.youtube !== undefined) { sets.push('youtube = ?'); args.push(body.youtube) }
      if (body.facebook !== undefined) { sets.push('facebook = ?'); args.push(body.facebook) }
      if (body.twitter !== undefined) { sets.push('twitter = ?'); args.push(body.twitter) }
      if (body.telegram !== undefined) { sets.push('telegram = ?'); args.push(body.telegram) }
      // Accept frontend short names too
      if (body.phone !== undefined) { sets.push('admin_phone = ?'); args.push(body.phone) }
      if (body.email !== undefined && body.admin_email === undefined) { sets.push('admin_email = ?'); args.push(body.email) }
      if (body.whatsapp !== undefined && body.admin_whatsapp === undefined) { sets.push('admin_whatsapp = ?'); args.push(body.whatsapp) }

      if (sets.length > 0) {
        const ex = await db.execute(`SELECT id FROM site_settings LIMIT 1`)
        if (ex.rows.length > 0) {
          args.push(ex.rows[0].id)
          await db.execute({ sql: `UPDATE site_settings SET ${sets.join(', ')} WHERE id = ?`, args })
        } else {
          await db.execute({
            sql: `INSERT INTO site_settings (id, admin_name, admin_phone, admin_email, admin_whatsapp, instagram, youtube, facebook, twitter, telegram) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [genId(), body.admin_name || body.name || '', body.admin_phone || body.phone || '', body.admin_email || body.email || '', body.admin_whatsapp || body.whatsapp || '', body.instagram || '', body.youtube || '', body.facebook || '', body.twitter || '', body.telegram || '']
          })
        }
      }
      return json(res, 200, { ok: true, message: 'Settings saved' })
    }

    // ============ SERVICES ============
    if (path === '/services' && method === 'GET') {
      const db = getDb()
      const r = await db.execute(`SELECT * FROM services WHERE status = 'active' ORDER BY category, name`)
      return json(res, 200, { services: r.rows })
    }

    if (path === '/admin/services' && method === 'GET') {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })
      const db = getDb()
      const r = await db.execute(`SELECT * FROM services ORDER BY category, name`)
      return json(res, 200, { services: r.rows })
    }

    if (path === '/admin/services' && method === 'POST') {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })
      const { name, category, price, description, platform, status } = req.body || {}
      if (!name || !category || !price) return json(res, 400, { error: 'Name, category, price required' })
      const db = getDb()
      const id = genId()
      await db.execute({
        sql: `INSERT INTO services (id, name, category, description, price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [id, name, category, description || '', price, status || 'active']
      })
      return json(res, 201, { ok: true, id })
    }

    // ============ USERS ============
    if (path === '/admin/users' && method === 'GET') {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })
      const db = getDb()
      const r = await db.execute(`SELECT id, email, username, name, wallet_balance as balance, status, created_at as createdAt FROM users ORDER BY created_at DESC`)
      return json(res, 200, { users: r.rows })
    }

    // ============ DEPOSITS ============
    if (path === '/deposits' && method === 'GET') {
      const user = verifyToken(req)
      if (!user) return json(res, 401, { error: 'Login required' })
      const db = getDb()
      const r = await db.execute({ sql: `SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC`, args: [user.id] })
      return json(res, 200, { deposits: r.rows })
    }

    if (path === '/deposits' && method === 'POST') {
      const user = verifyToken(req)
      if (!user) return json(res, 401, { error: 'Login required' })
      const { amount, method: payMethod, screenshot, transactionId } = req.body || {}
      if (!amount || !payMethod) return json(res, 400, { error: 'Amount and method required' })
      const db = getDb()
      const id = genId()
      await db.execute({
        sql: `INSERT INTO deposits (id, user_id, amount, method, screenshot, transaction_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
        args: [id, user.id, amount, payMethod, screenshot || '', transactionId || '']
      })
      return json(res, 201, { ok: true, id })
    }

    if (path === '/admin/deposits' && method === 'GET') {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })
      const db = getDb()
      const r = await db.execute(`SELECT d.*, u.email as userEmail, u.name as userName FROM deposits d LEFT JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC`)
      return json(res, 200, { deposits: r.rows })
    }

    if (path?.startsWith('/admin/deposits/') && (method === 'PUT' || method === 'PATCH')) {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })
      const depositId = path.split('/').pop()
      const { status } = req.body || {}
      if (!status) return json(res, 400, { error: 'Status required' })
      const db = getDb()
      const dep = await db.execute({ sql: `SELECT * FROM deposits WHERE id = ?`, args: [depositId] })
      if (dep.rows.length === 0) return json(res, 404, { error: 'Not found' })
      const d = dep.rows[0]
      await db.execute({ sql: `UPDATE deposits SET status = ? WHERE id = ?`, args: [status, depositId] })
      if (status === 'approved') {
        await db.execute({ sql: `UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?`, args: [d.amount, d.user_id] })
        await db.execute({
          sql: `INSERT INTO wallet_transactions (id, user_id, type, amount, description, status, created_at) VALUES (?, ?, 'credit', ?, ?, 'completed', datetime('now'))`,
          args: [genId(), d.user_id, d.amount, `Deposit approved #${depositId}`]
        })
      }
      return json(res, 200, { ok: true })
    }

    // ============ ORDERS ============
    if (path === '/orders' && method === 'GET') {
      const user = verifyToken(req)
      if (!user) return json(res, 401, { error: 'Login required' })
      const db = getDb()
      const r = await db.execute({ sql: `SELECT o.*, s.name as serviceName FROM orders o LEFT JOIN services s ON o.service_id = s.id WHERE o.user_id = ? ORDER BY o.created_at DESC`, args: [user.id] })
      return json(res, 200, { orders: r.rows })
    }

    if (path === '/orders' && method === 'POST') {
      const user = verifyToken(req)
      if (!user) return json(res, 401, { error: 'Login required' })
      const { serviceId, link, quantity } = req.body || {}
      if (!serviceId || !link) return json(res, 400, { error: 'Service and link required' })
      const db = getDb()
      const svc = await db.execute({ sql: `SELECT * FROM services WHERE id = ?`, args: [serviceId] })
      if (svc.rows.length === 0) return json(res, 404, { error: 'Service not found' })
      const price = svc.rows[0].price
      const usr = await db.execute({ sql: `SELECT wallet_balance FROM users WHERE id = ?`, args: [user.id] })
      const bal = usr.rows[0]?.wallet_balance || 0
      if (bal < price) return json(res, 400, { error: 'Insufficient balance' })
      const id = genId()
      await db.execute({
        sql: `INSERT INTO orders (id, user_id, service_id, link, quantity, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
        args: [id, user.id, serviceId, link, quantity || 100, price]
      })
      await db.execute({ sql: `UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?`, args: [price, user.id] })
      await db.execute({
        sql: `INSERT INTO wallet_transactions (id, user_id, type, amount, description, status, created_at) VALUES (?, ?, 'debit', ?, ?, 'completed', datetime('now'))`,
        args: [genId(), user.id, price, `Order #${id}`]
      })
      return json(res, 201, { ok: true, id })
    }

    if (path === '/admin/orders' && method === 'GET') {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })
      const db = getDb()
      const r = await db.execute(`SELECT o.*, u.email as userEmail, u.name as userName, s.name as serviceName FROM orders o LEFT JOIN users u ON o.user_id = u.id LEFT JOIN services s ON o.service_id = s.id ORDER BY o.created_at DESC`)
      return json(res, 200, { orders: r.rows })
    }

    if (path?.startsWith('/admin/orders/') && (method === 'PUT' || method === 'PATCH')) {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })
      const orderId = path.split('/').pop()
      const { status } = req.body || {}
      const db = getDb()
      await db.execute({ sql: `UPDATE orders SET status = ? WHERE id = ?`, args: [status, orderId] })
      return json(res, 200, { ok: true })
    }

    // ============ WALLET ============
    if (path === '/wallet' && method === 'GET') {
      const user = verifyToken(req)
      if (!user) return json(res, 401, { error: 'Login required' })
      const db = getDb()
      const usr = await db.execute({ sql: `SELECT wallet_balance FROM users WHERE id = ?`, args: [user.id] })
      const txns = await db.execute({ sql: `SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`, args: [user.id] })
      return json(res, 200, { balance: usr.rows[0]?.wallet_balance || 0, transactions: txns.rows })
    }

    if (path === '/wallet/adjust' && method === 'POST') {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })
      const { userId, amount, type, description } = req.body || {}
      if (!userId || !amount || !type) return json(res, 400, { error: 'userId, amount, type required' })
      const db = getDb()
      const usr = await db.execute({ sql: `SELECT wallet_balance FROM users WHERE id = ?`, args: [userId] })
      if (usr.rows.length === 0) return json(res, 404, { error: 'User not found' })
      const prevBal = usr.rows[0].wallet_balance || 0
      if (type === 'debit' && prevBal < amount) return json(res, 400, { error: 'Insufficient balance' })
      const change = type === 'credit' ? amount : -amount
      await db.execute({ sql: `UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?`, args: [change, userId] })
      await db.execute({
        sql: `INSERT INTO wallet_transactions (id, user_id, type, amount, previous_balance, new_balance, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', datetime('now'))`,
        args: [genId(), userId, type, amount, prevBal, prevBal + change, description || `Admin ${type}`]
      })
      return json(res, 200, { ok: true, previousBalance: prevBal, newBalance: prevBal + change })
    }

    // ============ NOTIFICATIONS ============
    if (path === '/notifications' && method === 'GET') {
      const user = verifyToken(req)
      if (!user) return json(res, 401, { error: 'Login required' })
      const db = getDb()
      const r = await db.execute({ sql: `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`, args: [user.id] })
      return json(res, 200, { notifications: r.rows })
    }

    // ============ PLANS ============
    if (path === '/plans' && method === 'GET') {
      const db = getDb()
      const r = await db.execute(`SELECT * FROM plans WHERE status = 'active' ORDER BY price`)
      return json(res, 200, { plans: r.rows })
    }

    // ============ SUPPORT TICKETS ============
    if (path === '/support/tickets' && method === 'GET') {
      const user = verifyToken(req)
      if (!user) return json(res, 401, { error: 'Login required' })
      const db = getDb()
      const r = await db.execute({ sql: `SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC`, args: [user.id] })
      return json(res, 200, { tickets: r.rows })
    }

    if (path === '/support/tickets' && method === 'POST') {
      const user = verifyToken(req)
      if (!user) return json(res, 401, { error: 'Login required' })
      const { subject, message, priority } = req.body || {}
      if (!subject || !message) return json(res, 400, { error: 'Subject and message required' })
      const db = getDb()
      const id = genId()
      await db.execute({
        sql: `INSERT INTO support_tickets (id, user_id, subject, message, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'open', datetime('now'), datetime('now'))`,
        args: [id, user.id, subject, message]
      })
      return json(res, 201, { ok: true, id })
    }

    if (path === '/admin/tickets' && method === 'GET') {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })
      const db = getDb()
      const r = await db.execute(`SELECT t.*, u.email as userEmail, u.name as userName FROM support_tickets t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC`)
      return json(res, 200, { tickets: r.rows })
    }

    // ============ TRANSACTIONS ============
    if (path === '/transactions' && method === 'GET') {
      const user = verifyToken(req)
      if (!user) return json(res, 401, { error: 'Login required' })
      const db = getDb()
      const r = await db.execute({ sql: `SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`, args: [user.id] })
      return json(res, 200, { transactions: r.rows })
    }

    // ============ PAYMENT SETTINGS ============
    if (path === '/payment-settings' && method === 'GET') {
      const db = getDb()
      const r = await db.execute(`SELECT * FROM payment_settings LIMIT 1`)
      return json(res, 200, { settings: r.rows.length > 0 ? r.rows[0] : null })
    }

    // ============ USER PROFILE ============
    if (path === '/user/profile' && method === 'GET') {
      const user = verifyToken(req)
      if (!user) return json(res, 401, { error: 'Login required' })
      const db = getDb()
      const r = await db.execute({ sql: `SELECT id, email, username, name, wallet_balance as balance, status, created_at as createdAt FROM users WHERE id = ?`, args: [user.id] })
      if (r.rows.length === 0) return json(res, 404, { error: 'Not found' })
      return json(res, 200, { user: r.rows[0] })
    }

    if (path === '/user/profile' && method === 'PUT') {
      const user = verifyToken(req)
      if (!user) return json(res, 401, { error: 'Login required' })
      const { name, phone } = req.body || {}
      const db = getDb()
      const sets: string[] = []
      const args: any[] = []
      if (name) { sets.push('name = ?'); args.push(name) }
      args.push(user.id)
      if (sets.length > 0) await db.execute({ sql: `UPDATE users SET ${sets.join(', ')} WHERE id = ?`, args })
      return json(res, 200, { ok: true })
    }

    // ============ ADMIN USER PLANS ============
    if (path === '/admin/user-plans' && method === 'GET') {
      const admin = verifyAdmin(req)
      if (!admin) return json(res, 401, { error: 'Admin access required' })
      const db = getDb()
      const r = await db.execute(`SELECT up.*, u.email as userEmail, u.name as userName, p.name as planName FROM user_plans up LEFT JOIN users u ON up.user_id = u.id LEFT JOIN plans p ON up.plan_id = p.id ORDER BY up.created_at DESC`)
      return json(res, 200, { userPlans: r.rows })
    }

    // ============ DEFAULT ============
    return json(res, 404, { error: 'Not found', path, method })

  } catch (err: any) {
    console.error('API Error:', err)
    return json(res, 500, { error: err.message || 'Internal server error' })
  }
}
