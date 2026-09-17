import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'pak-booster-secret-2026'

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// --- Helpers ---
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' },
  })
}

function verifyAuth(req: Request): any {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try { return jwt.verify(auth.slice(7), JWT_SECRET) as any } catch { return null }
}

async function query(sql: string, args?: any[]) {
  const result = await db.execute({ sql, args: args || [] })
  return result.rows
}

async function execute(sql: string, args?: any[]) {
  return await db.execute({ sql, args: args || [] })
}

// --- Seed on cold start ---
async function seedIfNeeded() {
  try {
    const existing = await query('SELECT id FROM admin_users LIMIT 1')
    if (existing.length === 0) {
      const hash = await bcrypt.hash('admin123', 12)
      await execute('INSERT INTO admin_users (id, username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))', ['admin-default', 'admin', 'admin@smmpanel.com', hash, 'superadmin'])
      await execute('INSERT INTO payment_settings (id, updated_at) VALUES ("default", datetime("now"))', [])
      await execute('INSERT OR IGNORE INTO site_settings (id, site_name, site_tagline, admin_name, admin_phone, admin_email, admin_whatsapp, instagram, youtube, facebook, twitter, telegram, updated_at) VALUES ("default", "PAK BOOSTER", "Social Services", "Waseem Abbas", "03479178048", "", "", "", "", "", "", "", datetime("now"))', [])
      console.log('✅ Seeded admin + settings')
    }
    const svcCount = await query('SELECT COUNT(*) as c FROM services')
    if ((svcCount[0] as any).c < 10) {
      const svcs = [
        ['Instagram Followers [Real]', 'Instagram', 'Real Instagram followers. HQ accounts.', 120, 100, 100000],
        ['Instagram Followers [Cheapest]', 'Instagram', 'Budget Instagram followers.', 50, 100, 500000],
        ['Instagram Likes [HQ Profile]', 'Instagram', 'Instagram post likes from HQ profiles.', 60, 50, 500000],
        ['Instagram Likes [Cheapest]', 'Instagram', 'Budget Instagram likes.', 25, 50, 1000000],
        ['Instagram Views [Reel/Video]', 'Instagram', 'Instagram reel/video views.', 15, 100, 10000000],
        ['Instagram Views [Story]', 'Instagram', 'Instagram story views.', 20, 100, 1000000],
        ['Instagram Comments [Custom]', 'Instagram', 'Custom Instagram comments.', 500, 10, 5000],
        ['Instagram Saves', 'Instagram', 'Instagram post saves.', 80, 50, 100000],
        ['Instagram Shares', 'Instagram', 'Instagram post shares.', 80, 50, 100000],
        ['TikTok Likes [HQ Profile] [Fast]', 'TikTok', 'TikTok likes from HQ profiles.', 90, 100, 1000000],
        ['TikTok Likes [Cheapest]', 'TikTok', 'Budget TikTok likes.', 35, 100, 2000000],
        ['TikTok Followers [HQ]', 'TikTok', 'TikTok followers HQ. 30-day refill.', 150, 100, 500000],
        ['TikTok Followers [Cheapest]', 'TikTok', 'Budget TikTok followers.', 60, 100, 1000000],
        ['TikTok Views [Real]', 'TikTok', 'TikTok views from real accounts.', 15, 500, 50000000],
        ['TikTok Views [Cheapest]', 'TikTok', 'Budget TikTok views.', 5, 1000, 100000000],
        ['TikTok Comments [Custom]', 'TikTok', 'Custom TikTok comments.', 400, 10, 5000],
        ['TikTok Shares', 'TikTok', 'TikTok video shares.', 100, 100, 100000],
        ['YouTube Subscribers [Real]', 'YouTube', 'Real subscribers. 30-day drop.', 300, 100, 100000],
        ['YouTube Subscribers [Cheapest]', 'YouTube', 'Budget YouTube subscribers.', 100, 100, 500000],
        ['YouTube Views [Monetizable]', 'YouTube', 'YouTube views with retention.', 200, 500, 10000000],
        ['YouTube Views [Cheapest]', 'YouTube', 'Budget YouTube views.', 50, 500, 50000000],
        ['YouTube Likes', 'YouTube', 'YouTube video likes.', 150, 50, 500000],
        ['YouTube Likes [Cheapest]', 'YouTube', 'Budget YouTube likes.', 60, 50, 1000000],
        ['YouTube Watch Hours', 'YouTube', 'YouTube watch hours for monetization.', 5000, 1000, 5000],
        ['Facebook Page Likes', 'Facebook', 'Real Facebook page likes.', 200, 100, 500000],
        ['Facebook Page Likes [Cheapest]', 'Facebook', 'Budget Facebook page likes.', 80, 100, 1000000],
        ['Facebook Post Likes', 'Facebook', 'Facebook post likes.', 50, 50, 500000],
        ['Facebook Followers', 'Facebook', 'Facebook profile/page followers.', 150, 100, 500000],
        ['Facebook Video Views', 'Facebook', 'Facebook video views.', 30, 500, 10000000],
        ['Telegram Members', 'Telegram', 'Telegram channel/group members.', 80, 100, 500000],
        ['Telegram Members [Cheapest]', 'Telegram', 'Budget Telegram members.', 40, 100, 1000000],
        ['Telegram Post Views', 'Telegram', 'Telegram channel post views.', 15, 100, 1000000],
        ['Twitter/X Followers [Real]', 'Twitter/X', 'Twitter followers HQ. 30-day refill.', 200, 100, 100000],
        ['Twitter/X Followers [Cheapest]', 'Twitter/X', 'Budget Twitter followers.', 80, 100, 500000],
        ['Twitter/X Likes', 'Twitter/X', 'Twitter tweet likes.', 100, 50, 500000],
        ['Twitter/X Retweets', 'Twitter/X', 'Twitter retweets.', 150, 50, 200000],
        ['Twitter/X Views', 'Twitter/X', 'Twitter tweet views.', 20, 500, 10000000],
        ['LinkedIn Connections', 'LinkedIn', 'LinkedIn profile connections.', 500, 50, 10000],
        ['Discord Server Members', 'Discord', 'Discord server members.', 100, 100, 100000],
        ['Spotify Plays', 'Spotify', 'Spotify track plays.', 100, 1000, 10000000],
        ['Spotify Followers', 'Spotify', 'Spotify artist followers.', 200, 100, 50000],
        ['Pinterest Followers', 'Pinterest', 'Pinterest account followers.', 150, 100, 100000],
        ['Threads Followers', 'Threads', 'Threads app followers.', 150, 100, 100000],
        ['Threads Likes', 'Threads', 'Threads post likes.', 80, 50, 200000],
        ['Snapchat Story Views', 'Snapchat', 'Snapchat story views.', 50, 500, 1000000],
        ['Website Traffic [Worldwide]', 'Website & SEO', 'Real website traffic worldwide.', 100, 1000, 10000000],
        ['Website Traffic [Pakistan]', 'Website & SEO', 'Website traffic from Pakistan.', 200, 1000, 5000000],
        ['Google Reviews [5 Star]', 'Website & SEO', 'Google business 5-star reviews.', 500, 1, 100],
        ['AI Image Generation', 'AI Services', 'Custom AI generated images.', 100, 1, 100],
        ['AI Video Generation', 'AI Services', 'AI generated short videos.', 500, 1, 20],
        ['AI Content Writing', 'AI Services', 'AI-powered content writing.', 200, 1, 50],
        ['AI Logo Design', 'AI Services', 'AI generated logo designs.', 300, 1, 20],
      ]
      for (const s of svcs) {
        await execute('INSERT OR IGNORE INTO services (id, name, category, description, price, min_quantity, max_quantity, avg_start_time, speed, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "active", datetime("now"))', [`svc-${Math.random().toString(36).slice(2,10)}`, s[0], s[1], s[2], s[3], s[4], s[5], '1 hour', '5000/day'])
      }
      console.log('✅ Seeded services')
    }
    const planCount = await query('SELECT COUNT(*) as c FROM plans')
    if ((planCount[0] as any).c < 1) {
      await execute('INSERT INTO plans (id, name, platform, description, price, duration, views, subscribers, features, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "active", datetime("now"))', ['plan-yt', 'YouTube Growth', 'YouTube', 'Complete YouTube growth package', 1000, 30, 10000, 500, 'Views, Subscribers, Likes'])
      await execute('INSERT INTO plans (id, name, platform, description, price, duration, views, subscribers, features, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "active", datetime("now"))', ['plan-ig', 'Instagram Boost', 'Instagram', 'Instagram growth package', 500, 30, 0, 1000, 'Followers, Likes'])
      await execute('INSERT INTO plans (id, name, platform, description, price, duration, views, subscribers, features, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "active", datetime("now"))', ['plan-tt', 'TikTok Starter', 'TikTok', 'TikTok growth package', 750, 30, 50000, 200, 'Views, Followers, Likes'])
      console.log('✅ Seeded plans')
    }
  } catch (e: any) { console.log('Seed skipped:', e.message) }
}
seedIfNeeded()

function genId() { return Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15) }

// --- ROUTER ---
export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' } })
  }

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api/, '')
  const method = req.method

  try {
    // ====== PUBLIC ROUTES ======

    // Health
    if (path === '/health' || path === '') {
      return json({ ok: true, timestamp: new Date().toISOString() })
    }

    // Payment Settings
    if (path === '/payment-settings' && method === 'GET') {
      let rows = await query('SELECT * FROM payment_settings LIMIT 1')
      if (rows.length === 0) {
        await execute('INSERT INTO payment_settings (id, updated_at) VALUES ("default", datetime("now"))')
        rows = await query('SELECT * FROM payment_settings LIMIT 1')
      }
      return json({ settings: rows[0] })
    }

    // Site Settings (public)
    if (path === '/site-settings' && method === 'GET') {
      let rows = await query('SELECT * FROM site_settings LIMIT 1')
      if (rows.length === 0) {
        await execute('INSERT OR IGNORE INTO site_settings (id, site_name, site_tagline, admin_name, admin_phone, admin_email, admin_whatsapp, instagram, youtube, facebook, twitter, telegram, updated_at) VALUES ("default", "PAK BOOSTER", "Social Services", "Waseem Abbas", "03479178048", "", "", "", "", "", "", "", datetime("now"))')
        rows = await query('SELECT * FROM site_settings LIMIT 1')
      }
      return json({ settings: rows[0] })
    }

    // Services (public)
    if (path === '/services' && method === 'GET') {
      const services = await query('SELECT * FROM services WHERE status = "active" ORDER BY created_at DESC')
      return json({ services })
    }

    // Plans (public)
    if (path === '/plans' && method === 'GET') {
      const plans = await query('SELECT * FROM plans WHERE status = "active" ORDER BY created_at DESC')
      return json({ plans })
    }

    // ====== AUTH ROUTES ======

    // Register
    if (path === '/auth/register' && method === 'POST') {
      const body = await req.json()
      const { email, username, password, name } = body
      if (!email || !username || !password) return json({ error: 'Email, username and password required' }, 400)
      const existing = await query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username])
      if (existing.length > 0) return json({ error: 'Email or username already exists' }, 409)
      const passwordHash = await bcrypt.hash(password, 12)
      const id = genId()
      await execute('INSERT INTO users (id, email, username, password_hash, name, wallet_balance, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, "active", datetime("now"), datetime("now"))', [id, email, username, passwordHash, name || username])
      const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '30d' })
      return json({ token, user: { id, email, username, name: name || username, walletBalance: 0, status: 'active' } })
    }

    // Login
    if (path === '/auth/login' && method === 'POST') {
      const body = await req.json()
      const { email, password } = body
      if (!email || !password) return json({ error: 'Email and password required' }, 400)

      // Check admin first
      const admins = await query('SELECT * FROM admin_users WHERE username = ? OR email = ?', [email, email])
      if (admins.length > 0) {
        const admin = admins[0] as any
        const valid = await bcrypt.compare(password, admin.password_hash)
        if (valid) {
          const token = jwt.sign({ adminId: admin.id, isAdmin: true }, JWT_SECRET, { expiresIn: '30d' })
          return json({ token, admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role }, isAdmin: true })
        }
      }

      // Check user
      const users = await query('SELECT * FROM users WHERE email = ? OR username = ?', [email, email])
      if (users.length === 0) return json({ error: 'Invalid credentials' }, 401)
      const user = users[0] as any
      const valid = await bcrypt.compare(password, user.password_hash)
      if (!valid) return json({ error: 'Invalid credentials' }, 401)
      if (user.status !== 'active') return json({ error: 'Account suspended' }, 403)
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
      return json({ token, user: { id: user.id, email: user.email, username: user.username, name: user.name, walletBalance: user.wallet_balance, status: user.status } })
    }

    // Auth Me
    if (path === '/auth/me' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      if (decoded.isAdmin) {
        const admins = await query('SELECT id, username, email, role FROM admin_users WHERE id = ?', [decoded.adminId])
        if (admins.length === 0) return json({ error: 'Admin not found' }, 404)
        return json({ admin: admins[0], isAdmin: true })
      }
      const users = await query('SELECT id, email, username, name, wallet_balance, status, created_at FROM users WHERE id = ?', [decoded.userId])
      if (users.length === 0) return json({ error: 'User not found' }, 404)
      const u = users[0] as any
      return json({ user: { id: u.id, email: u.email, username: u.username, name: u.name, walletBalance: u.wallet_balance, status: u.status, createdAt: u.created_at } })
    }

    // Admin Login (dedicated endpoint)
    if (path === '/admin/login' && method === 'POST') {
      const body = await req.json()
      const { username, password } = body
      const admins = await query('SELECT * FROM admin_users WHERE username = ?', [username])
      if (admins.length === 0) return json({ error: 'Invalid credentials' }, 401)
      const admin = admins[0] as any
      const valid = await bcrypt.compare(password, admin.password_hash)
      if (!valid) return json({ error: 'Invalid credentials' }, 401)
      const token = jwt.sign({ adminId: admin.id, isAdmin: true }, JWT_SECRET, { expiresIn: '30d' })
      return json({ token, admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role } })
    }

    // Change Password
    if (path === '/auth/change-password' && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const body = await req.json()
      const { currentPassword, newPassword } = body
      const users = await query('SELECT * FROM users WHERE id = ?', [decoded.userId])
      if (users.length === 0) return json({ error: 'User not found' }, 404)
      const user = users[0] as any
      const valid = await bcrypt.compare(currentPassword, user.password_hash)
      if (!valid) return json({ error: 'Current password is incorrect' }, 400)
      const hash = await bcrypt.hash(newPassword, 12)
      await execute('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?', [hash, decoded.userId])
      return json({ success: true })
    }

    // ====== PROTECTED USER ROUTES ======

    // Deposits - list
    if (path === '/deposits' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      const deposits = await query('SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC', [decoded.userId])
      return json({ deposits })
    }

    // Deposits - create
    if (path === '/deposits' && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      const body = await req.json()
      const { amount, method: payMethod, transactionId, senderInfo, screenshot } = body
      if (!amount || !payMethod) return json({ error: 'Amount and method required' }, 400)
      const id = genId()
      await execute('INSERT INTO deposits (id, user_id, amount, method, transaction_id, sender_info, screenshot, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, "pending", datetime("now"))', [id, decoded.userId, parseFloat(amount), payMethod, transactionId || null, senderInfo || null, screenshot || null])
      await execute('INSERT INTO notifications (id, user_id, title, message, type, read_status, created_at) VALUES (?, ?, "Deposit Submitted", ?, "info", 0, datetime("now"))', [genId(), decoded.userId, `Your Rs. ${amount} deposit request has been submitted.`])
      return json({ deposit: { id, amount, method: payMethod, status: 'pending' } })
    }

    // Orders - list
    if (path === '/orders' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      const orders = await query('SELECT o.*, s.name as service_name, s.category as service_category FROM orders o LEFT JOIN services s ON o.service_id = s.id WHERE o.user_id = ? ORDER BY o.created_at DESC', [decoded.userId])
      return json({ orders })
    }

    // Orders - create
    if (path === '/orders' && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      const body = await req.json()
      const { serviceId, link, quantity } = body
      if (!serviceId || !link || !quantity) return json({ error: 'Service, link and quantity required' }, 400)
      const svcs = await query('SELECT * FROM services WHERE id = ? AND status = "active"', [serviceId])
      if (svcs.length === 0) return json({ error: 'Service not found' }, 404)
      const service = svcs[0] as any
      if (quantity < service.min_quantity || quantity > service.max_quantity) return json({ error: `Quantity must be between ${service.min_quantity} and ${service.max_quantity}` }, 400)
      const amount = parseFloat((service.price * quantity).toFixed(2))
      const users = await query('SELECT * FROM users WHERE id = ?', [decoded.userId])
      if (users.length === 0) return json({ error: 'User not found' }, 404)
      const user = users[0] as any
      if (user.wallet_balance < amount) return json({ error: 'Insufficient balance. Please add funds.' }, 400)
      const orderId = genId()
      const newBalance = user.wallet_balance - amount
      await execute('UPDATE users SET wallet_balance = ?, updated_at = datetime("now") WHERE id = ?', [newBalance, decoded.userId])
      await execute('INSERT INTO orders (id, user_id, service_id, link, quantity, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, "pending", datetime("now"))', [orderId, decoded.userId, serviceId, link, quantity, amount])
      await execute('INSERT INTO wallet_transactions (id, user_id, type, amount, previous_balance, new_balance, description, order_id, status, created_at) VALUES (?, ?, "debit", ?, ?, ?, ?, ?, "completed", datetime("now"))', [genId(), decoded.userId, amount, user.wallet_balance, newBalance, `Order #${orderId.slice(-6).toUpperCase()} - ${link}`, orderId])
      await execute('INSERT INTO notifications (id, user_id, title, message, type, read_status, created_at) VALUES (?, ?, "Order Submitted", ?, "info", 0, datetime("now"))', [genId(), decoded.userId, `Order #${orderId.slice(-6).toUpperCase()} for ${service.name} has been submitted.`])
      return json({ order: { id: orderId, amount, status: 'pending' }, balanceAfter: newBalance })
    }

    // Wallet Transactions
    if (path === '/wallet-transactions' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      const txns = await query('SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC', [decoded.userId])
      return json({ transactions: txns })
    }

    // Notifications
    if (path === '/notifications' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      const notifs = await query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [decoded.userId])
      return json({ notifications: notifs })
    }

    if (path === '/notifications/read-all' && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      await execute('UPDATE notifications SET read_status = 1 WHERE user_id = ? AND read_status = 0', [decoded.userId])
      return json({ success: true })
    }

    if (path.startsWith('/notifications/') && path.endsWith('/read') && method === 'PUT') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      const id = path.split('/')[2]
      await execute('UPDATE notifications SET read_status = 1 WHERE id = ?', [id])
      return json({ success: true })
    }

    // Support Tickets
    if (path === '/support-tickets' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      const tickets = await query('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC', [decoded.userId])
      return json({ tickets })
    }

    if (path === '/support-tickets' && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      const body = await req.json()
      const id = genId()
      await execute('INSERT INTO support_tickets (id, user_id, subject, message, status, created_at, updated_at) VALUES (?, ?, ?, ?, "open", datetime("now"), datetime("now"))', [id, decoded.userId, body.subject, body.message])
      return json({ ticket: { id, subject: body.subject, status: 'open' } })
    }

    // User Plans
    if (path === '/user-plans' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      const userPlans = await query('SELECT up.*, p.name as plan_name, p.platform, p.description as plan_description, p.price as plan_price, p.duration, p.features FROM user_plans up LEFT JOIN plans p ON up.plan_id = p.id WHERE up.user_id = ? ORDER BY up.created_at DESC', [decoded.userId])
      return json({ userPlans })
    }

    // ====== ADMIN ROUTES ======
    // All admin routes require isAdmin token

    // Admin Dashboard
    if (path === '/admin/dashboard' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const [totalUsers] = await query('SELECT COUNT(*) as c FROM users')
      const [pendingDep] = await query('SELECT COALESCE(SUM(amount),0) as s FROM deposits WHERE status = "pending"')
      const [approvedDep] = await query('SELECT COALESCE(SUM(amount),0) as s FROM deposits WHERE status = "approved"')
      const [rejectedDep] = await query('SELECT COALESCE(SUM(amount),0) as s FROM deposits WHERE status = "rejected"')
      const [totalOrders] = await query('SELECT COUNT(*) as c FROM orders')
      const [pendingOrd] = await query('SELECT COUNT(*) as c FROM orders WHERE status = "pending"')
      const [processingOrd] = await query('SELECT COUNT(*) as c FROM orders WHERE status = "processing"')
      const [completedOrd] = await query('SELECT COUNT(*) as c FROM orders WHERE status = "completed"')
      const [totalRev] = await query('SELECT COALESCE(SUM(amount),0) as s FROM orders WHERE status IN ("completed","processing")')
      const [credits] = await query('SELECT COALESCE(SUM(amount),0) as s FROM wallet_transactions WHERE type = "credit"')
      const [debits] = await query('SELECT COALESCE(SUM(amount),0) as s FROM wallet_transactions WHERE type = "debit"')
      return json({
        totalUsers: (totalUsers as any).c,
        totalDeposits: (approvedDep as any).s,
        pendingDeposits: (pendingDep as any).s,
        approvedDeposits: (approvedDep as any).s,
        rejectedDeposits: (rejectedDep as any).s,
        totalOrders: (totalOrders as any).c,
        pendingOrders: (pendingOrd as any).c,
        processingOrders: (processingOrd as any).c,
        completedOrders: (completedOrd as any).c,
        totalRevenue: (totalRev as any).s,
        walletActivity: (credits as any).s - (debits as any).s,
      })
    }

    // Admin Users
    if (path === '/admin/users' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const users = await query('SELECT id, email, username, name, wallet_balance, status, created_at FROM users ORDER BY created_at DESC')
      return json({ users })
    }

    // Admin Services
    if (path === '/admin/services' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const services = await query('SELECT * FROM services ORDER BY created_at DESC')
      return json({ services })
    }

    if (path === '/admin/services' && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const body = await req.json()
      const id = genId()
      await execute('INSERT INTO services (id, name, category, description, price, min_quantity, max_quantity, avg_start_time, speed, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))', [id, body.name, body.category, body.description, body.price, body.minQuantity, body.maxQuantity, body.avgStartTime || '1 hour', body.speed || '5000/day', body.status || 'active'])
      return json({ service: { id, ...body } })
    }

    if (path.startsWith('/admin/services/') && path !== '/admin/services' && method === 'PUT') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      const body = await req.json()
      const sets: string[] = []
      const args: any[] = []
      if (body.name !== undefined) { sets.push('name = ?'); args.push(body.name) }
      if (body.category !== undefined) { sets.push('category = ?'); args.push(body.category) }
      if (body.description !== undefined) { sets.push('description = ?'); args.push(body.description) }
      if (body.price !== undefined) { sets.push('price = ?'); args.push(body.price) }
      if (body.status !== undefined) { sets.push('status = ?'); args.push(body.status) }
      if (body.minQuantity !== undefined) { sets.push('min_quantity = ?'); args.push(body.minQuantity) }
      if (body.maxQuantity !== undefined) { sets.push('max_quantity = ?'); args.push(body.maxQuantity) }
      if (sets.length > 0) { args.push(id); await execute(`UPDATE services SET ${sets.join(', ')} WHERE id = ?`, args) }
      return json({ success: true })
    }

    if (path.startsWith('/admin/services/') && path !== '/admin/services' && method === 'DELETE') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      await execute('DELETE FROM services WHERE id = ?', [id])
      return json({ success: true })
    }

    // Admin Deposits
    if (path === '/admin/deposits' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const status = url.searchParams.get('status')
      let sql = 'SELECT d.*, u.username, u.email, u.name as user_name FROM deposits d LEFT JOIN users u ON d.user_id = u.id'
      const args: any[] = []
      if (status) { sql += ' WHERE d.status = ?'; args.push(status) }
      sql += ' ORDER BY d.created_at DESC'
      const deposits = await query(sql, args)
      return json({ deposits })
    }

    if (path.startsWith('/admin/deposits/') && path.endsWith('/approve') && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      const deposits = await query('SELECT * FROM deposits WHERE id = ?', [id])
      if (deposits.length === 0) return json({ error: 'Deposit not found' }, 404)
      const deposit = deposits[0] as any
      if (deposit.status !== 'pending') return json({ error: 'Already processed' }, 400)
      const users = await query('SELECT * FROM users WHERE id = ?', [deposit.user_id])
      if (users.length === 0) return json({ error: 'User not found' }, 404)
      const user = users[0] as any
      const newBalance = user.wallet_balance + deposit.amount
      await execute('UPDATE users SET wallet_balance = ?, updated_at = datetime("now") WHERE id = ?', [newBalance, deposit.user_id])
      await execute('UPDATE deposits SET status = "approved", reviewed_by = ?, reviewed_at = datetime("now") WHERE id = ?', [decoded.adminId, id])
      await execute('INSERT INTO wallet_transactions (id, user_id, type, amount, previous_balance, new_balance, description, deposit_id, status, created_at) VALUES (?, ?, "credit", ?, ?, ?, ?, ?, "completed", datetime("now"))', [genId(), deposit.user_id, deposit.amount, user.wallet_balance, newBalance, `Deposit via ${deposit.method}`, id])
      await execute('INSERT INTO notifications (id, user_id, title, message, type, read_status, created_at) VALUES (?, ?, "Deposit Approved", ?, "success", 0, datetime("now"))', [genId(), deposit.user_id, `Your Rs. ${deposit.amount} deposit has been approved.`])
      return json({ success: true, newBalance })
    }

    if (path.startsWith('/admin/deposits/') && path.endsWith('/reject') && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      const deposits = await query('SELECT * FROM deposits WHERE id = ?', [id])
      if (deposits.length === 0) return json({ error: 'Deposit not found' }, 404)
      const deposit = deposits[0] as any
      if (deposit.status !== 'pending') return json({ error: 'Already processed' }, 400)
      await execute('UPDATE deposits SET status = "rejected", reviewed_by = ?, reviewed_at = datetime("now") WHERE id = ?', [decoded.adminId, id])
      await execute('INSERT INTO notifications (id, user_id, title, message, type, read_status, created_at) VALUES (?, ?, "Deposit Rejected", ?, "error", 0, datetime("now"))', [genId(), deposit.user_id, `Your Rs. ${deposit.amount} deposit has been rejected.`])
      return json({ success: true })
    }

    // Admin Orders
    if (path === '/admin/orders' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const status = url.searchParams.get('status')
      let sql = 'SELECT o.*, s.name as service_name, s.category as service_category, u.username, u.email FROM orders o LEFT JOIN services s ON o.service_id = s.id LEFT JOIN users u ON o.user_id = u.id'
      const args: any[] = []
      if (status) { sql += ' WHERE o.status = ?'; args.push(status) }
      sql += ' ORDER BY o.created_at DESC'
      const orders = await query(sql, args)
      return json({ orders })
    }

    if (path.startsWith('/admin/orders/') && path.endsWith('/start') && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      const orders = await query('SELECT * FROM orders WHERE id = ?', [id])
      if (orders.length === 0) return json({ error: 'Order not found' }, 404)
      const order = orders[0] as any
      if (order.status !== 'pending') return json({ error: 'Already processed' }, 400)
      await execute('UPDATE orders SET status = "processing", approved_by = ? WHERE id = ?', [decoded.adminId, id])
      await execute('INSERT INTO notifications (id, user_id, title, message, type, read_status, created_at) VALUES (?, ?, "Order Processing", ?, "success", 0, datetime("now"))', [genId(), order.user_id, `Your order #${id.slice(-6).toUpperCase()} is now processing.`])
      return json({ success: true })
    }

    if (path.startsWith('/admin/orders/') && path.endsWith('/complete') && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      await execute('UPDATE orders SET status = "completed", completed_at = datetime("now") WHERE id = ?', [id])
      const orders = await query('SELECT user_id FROM orders WHERE id = ?', [id])
      if (orders.length > 0) {
        await execute('INSERT INTO notifications (id, user_id, title, message, type, read_status, created_at) VALUES (?, ?, "Order Completed", ?, "success", 0, datetime("now"))', [genId(), (orders[0] as any).user_id, `Your order #${id.slice(-6).toUpperCase()} has been completed!`])
      }
      return json({ success: true })
    }

    if (path.startsWith('/admin/orders/') && path.endsWith('/cancel') && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      await execute('UPDATE orders SET status = "cancelled" WHERE id = ?', [id])
      return json({ success: true })
    }

    // Admin Wallet Transactions
    if (path === '/admin/wallet-transactions' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const txns = await query('SELECT wt.*, u.username, u.email FROM wallet_transactions wt LEFT JOIN users u ON wt.user_id = u.id ORDER BY wt.created_at DESC')
      return json({ transactions: txns })
    }

    // Admin Adjust Balance
    if (path.startsWith('/admin/users/') && path.endsWith('/adjust-balance') && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const userId = path.split('/')[3]
      const body = await req.json()
      const { amount, type, description } = body
      const users = await query('SELECT * FROM users WHERE id = ?', [userId])
      if (users.length === 0) return json({ error: 'User not found' }, 404)
      const user = users[0] as any
      const absAmount = Math.abs(amount)
      const newBalance = type === 'credit' ? user.wallet_balance + absAmount : user.wallet_balance - absAmount
      if (newBalance < 0) return json({ error: 'Insufficient balance' }, 400)
      await execute('UPDATE users SET wallet_balance = ?, updated_at = datetime("now") WHERE id = ?', [newBalance, userId])
      await execute('INSERT INTO wallet_transactions (id, user_id, type, amount, previous_balance, new_balance, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, "completed", datetime("now"))', [genId(), userId, type, absAmount, user.wallet_balance, newBalance, description || `Admin ${type}`])
      return json({ success: true, newBalance })
    }

    // Admin Support Tickets
    if (path === '/admin/support-tickets' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const tickets = await query('SELECT st.*, u.username, u.email FROM support_tickets st LEFT JOIN users u ON st.user_id = u.id ORDER BY st.created_at DESC')
      return json({ tickets })
    }

    // Admin Plans
    if (path === '/admin/plans' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const plans = await query('SELECT * FROM plans ORDER BY created_at DESC')
      return json({ plans })
    }

    if (path === '/admin/plans' && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const body = await req.json()
      const id = genId()
      await execute('INSERT INTO plans (id, name, platform, description, price, duration, views, subscribers, features, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))', [id, body.name, body.platform, body.description, body.price, body.duration, body.views || 0, body.subscribers || 0, body.features || '', body.status || 'active'])
      return json({ plan: { id, ...body } })
    }

    if (path.startsWith('/admin/plans/') && path !== '/admin/plans' && method === 'PUT') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      const body = await req.json()
      const sets: string[] = []
      const args: any[] = []
      if (body.name) { sets.push('name = ?'); args.push(body.name) }
      if (body.platform) { sets.push('platform = ?'); args.push(body.platform) }
      if (body.description) { sets.push('description = ?'); args.push(body.description) }
      if (body.price !== undefined) { sets.push('price = ?'); args.push(body.price) }
      if (body.status) { sets.push('status = ?'); args.push(body.status) }
      if (sets.length > 0) { args.push(id); await execute(`UPDATE plans SET ${sets.join(', ')} WHERE id = ?`, args) }
      return json({ success: true })
    }

    if (path.startsWith('/admin/plans/') && path !== '/admin/plans' && method === 'DELETE') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      await execute('DELETE FROM plans WHERE id = ?', [id])
      return json({ success: true })
    }

    // Admin Payment Settings
    if (path === '/admin/payment-settings' && method === 'PUT') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const body = await req.json()
      const sets: string[] = []
      const args: any[] = []
      for (const [k, v] of Object.entries(body)) {
        if (k === 'id' || k === 'updatedAt') continue
        const col = k.replace(/([A-Z])/g, '_$1').toLowerCase()
        sets.push(`${col} = ?`)
        args.push(v)
      }
      if (sets.length > 0) {
        sets.push('updated_at = datetime("now")')
        await execute(`UPDATE payment_settings SET ${sets.join(', ')} WHERE id = "default"`, args)
      }
      const rows = await query('SELECT * FROM payment_settings LIMIT 1')
      return json({ settings: rows[0] })
    }

    // Admin Site Settings
    if (path === '/admin/site-settings' && method === 'PUT') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const body = await req.json()
      await execute('UPDATE site_settings SET site_name = ?, site_tagline = ?, admin_name = ?, admin_phone = ?, admin_email = ?, admin_whatsapp = ?, instagram = ?, youtube = ?, facebook = ?, twitter = ?, telegram = ?, updated_at = datetime("now") WHERE id = "default"', [
        body.siteName || 'PAK BOOSTER', body.siteTagline || 'Social Services',
        body.adminName || '', body.adminPhone || '', body.adminEmail || '',
        body.adminWhatsapp || '', body.instagram || '', body.youtube || '',
        body.facebook || '', body.twitter || '', body.telegram || ''
      ])
      const rows = await query('SELECT * FROM site_settings LIMIT 1')
      return json({ settings: rows[0] })
    }

    // Admin Change Credentials
    if (path === '/admin/change-credentials' && method === 'PUT') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const body = await req.json()
      const admins = await query('SELECT * FROM admin_users WHERE id = ?', [decoded.adminId])
      if (admins.length === 0) return json({ error: 'Admin not found' }, 404)
      const admin = admins[0] as any
      if (body.currentPassword) {
        const valid = await bcrypt.compare(body.currentPassword, admin.password_hash)
        if (!valid) return json({ error: 'Current password is incorrect' }, 400)
      }
      if (body.newUsername) {
        const exists = await query('SELECT id FROM admin_users WHERE username = ? AND id != ?', [body.newUsername, decoded.adminId])
        if (exists.length > 0) return json({ error: 'Username already taken' }, 409)
        await execute('UPDATE admin_users SET username = ? WHERE id = ?', [body.newUsername, decoded.adminId])
      }
      if (body.newPassword) {
        const hash = await bcrypt.hash(body.newPassword, 12)
        await execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, decoded.adminId])
      }
      if (body.email) {
        await execute('UPDATE admin_users SET email = ? WHERE id = ?', [body.email, decoded.adminId])
      }
      const updated = await query('SELECT id, username, email, role FROM admin_users WHERE id = ?', [decoded.adminId])
      const newToken = jwt.sign({ adminId: decoded.adminId, isAdmin: true }, JWT_SECRET, { expiresIn: '30d' })
      return json({ success: true, token: newToken, admin: updated[0] })
    }

    // Admin Backup Export
    if (path === '/admin/backup/export' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const [users, adminUsers, services, deposits, orders, walletTransactions, notifications, supportTickets, plans, userPlans, paymentSettings, siteSettings] = await Promise.all([
        query('SELECT * FROM users'), query('SELECT * FROM admin_users'), query('SELECT * FROM services'),
        query('SELECT * FROM deposits'), query('SELECT * FROM orders'), query('SELECT * FROM wallet_transactions'),
        query('SELECT * FROM notifications'), query('SELECT * FROM support_tickets'), query('SELECT * FROM plans'),
        query('SELECT * FROM user_plans'), query('SELECT * FROM payment_settings'), query('SELECT * FROM site_settings'),
      ])
      return json({
        version: '1.0', exportedAt: new Date().toISOString(),
        data: { users, adminUsers, services, deposits, orders, walletTransactions, notifications, supportTickets, plans, userPlans, paymentSettings, siteSettings }
      })
    }

    // Admin Me (verify admin token)
    if (path === '/admin/me' && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const admins = await query('SELECT id, username, email, role FROM admin_users WHERE id = ?', [decoded.adminId])
      if (admins.length === 0) return json({ error: 'Admin not found' }, 404)
      return json({ admin: admins[0], isAdmin: true })
    }

    // Admin Seed (ensure admin + data exists)
    if (path === '/admin/seed' && method === 'POST') {
      await seedIfNeeded()
      return json({ success: true, message: 'Seeding completed' })
    }

    // Admin Support Ticket Reply
    if (path.startsWith('/admin/support-tickets/') && path.endsWith('/reply') && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      const body = await req.json()
      await execute('UPDATE support_tickets SET reply = ?, status = ?, updated_at = datetime(\"now\") WHERE id = ?', [body.reply, body.status || 'replied', id])
      const tickets = await query('SELECT user_id, subject FROM support_tickets WHERE id = ?', [id])
      if (tickets.length > 0) {
        const t = tickets[0] as any
        await execute('INSERT INTO notifications (id, user_id, title, message, type, read_status, created_at) VALUES (?, ?, \"Support Reply\", ?, \"info\", 0, datetime(\"now\"))', [genId(), t.user_id, `Admin replied to your ticket: ${t.subject}`])
      }
      return json({ success: true })
    }

    // Admin Backup Import
    if (path === '/admin/backup/import' && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const body = await req.json()
      return json({ success: true, message: 'Backup import not supported on Turso standalone' })
    }

    // Get Single User (admin)
    if (path.startsWith('/admin/users/') && path !== '/admin/users' && !path.includes('adjust-balance') && method === 'GET') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      const users = await query('SELECT id, email, username, name, wallet_balance, status, created_at FROM users WHERE id = ?', [id])
      if (users.length === 0) return json({ error: 'User not found' }, 404)
      return json({ user: users[0] })
    }

    // Update User (admin)
    if (path.startsWith('/admin/users/') && path !== '/admin/users' && !path.includes('adjust-balance') && method === 'PUT') {
      const decoded = verifyAuth(req)
      if (!decoded?.isAdmin) return json({ error: 'Admin access required' }, 403)
      const id = path.split('/')[3]
      const body = await req.json()
      const sets: string[] = []
      const args: any[] = []
      if (body.status) { sets.push('status = ?'); args.push(body.status) }
      if (body.name) { sets.push('name = ?'); args.push(body.name) }
      if (sets.length > 0) { args.push(id); await execute(`UPDATE users SET ${sets.join(', ')}, updated_at = datetime(\"now\") WHERE id = ?`, args) }
      return json({ success: true })
    }

    // User Plans - create (purchase plan)
    if (path === '/user-plans' && method === 'POST') {
      const decoded = verifyAuth(req)
      if (!decoded || decoded.isAdmin) return json({ error: 'Unauthorized' }, 401)
      const body = await req.json()
      const plans = await query('SELECT * FROM plans WHERE id = ? AND status = \"active\"', [body.planId])
      if (plans.length === 0) return json({ error: 'Plan not found' }, 404)
      const plan = plans[0] as any
      const users = await query('SELECT * FROM users WHERE id = ?', [decoded.userId])
      if (users.length === 0) return json({ error: 'User not found' }, 404)
      const user = users[0] as any
      if (user.wallet_balance < plan.price) return json({ error: 'Insufficient balance' }, 400)
      const newBalance = user.wallet_balance - plan.price
      await execute('UPDATE users SET wallet_balance = ?, updated_at = datetime(\"now\") WHERE id = ?', [newBalance, decoded.userId])
      const id = genId()
      const expiresAt = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString()
      await execute('INSERT INTO user_plans (id, user_id, plan_id, status, expires_at, created_at) VALUES (?, ?, ?, \"active\", ?, datetime(\"now\"))', [id, decoded.userId, body.planId, expiresAt])
      await execute('INSERT INTO wallet_transactions (id, user_id, type, amount, previous_balance, new_balance, description, status, created_at) VALUES (?, ?, \"debit\", ?, ?, ?, ?, \"completed\", datetime(\"now\"))', [genId(), decoded.userId, plan.price, user.wallet_balance, newBalance, `Purchased plan: ${plan.name}`])
      return json({ userPlan: { id, planId: body.planId, status: 'active' }, balanceAfter: newBalance })
    }

    // 404
    return json({ error: 'Not found', path }, 404)

  } catch (e: any) {
    console.error('[API Error]', e)
    return json({ error: e?.message || 'Internal server error' }, 500)
  }
}
