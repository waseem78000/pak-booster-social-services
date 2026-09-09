import { Hono } from 'hono'
import { prisma } from './src/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const app = new Hono()
const JWT_SECRET = process.env.JWT_SECRET || 'smm-panel-secret-key-2026'
const UPLOADS_DIR = join(process.cwd(), 'uploads')
// hot reload trigger 2

// --- HEALTH CHECK ---
app.get('/health', (c) => {
  return c.json({ ok: true, timestamp: new Date().toISOString() })
})

// --- AUTO-SEED (runs once on startup) ---
const seedOnce = async () => {
  try {
    const existingAdmin = await prisma.adminUser.findFirst()
    if (!existingAdmin) {
      console.log('🌱 Seeding default admin...')
      const adminHash = await bcrypt.hash('admin123', 12)
      await prisma.adminUser.create({
        data: { username: 'admin', email: 'admin@smmpanel.com', passwordHash: adminHash, role: 'superadmin' }
      })
      await prisma.paymentSettings.create({ data: {} })
    }
    const siteSettingsExist = await prisma.siteSettings.findFirst()
    if (!siteSettingsExist) {
      await prisma.siteSettings.create({
        data: { adminName: 'Waseem Abbas', adminPhone: '03479178048', adminEmail: '', siteName: 'PAK BOOSTER', siteTagline: 'Social Services' }
      })
      console.log('✅ Seeded site settings')
    }
    const serviceCount = await prisma.service.count()
    if (serviceCount < 10) {
      console.log('🌱 Seeding services...')
      const svcs = [
        { name: 'Instagram Followers [Real]', category: 'Instagram', description: 'Real Instagram followers with profile picture & posts. HQ accounts. No refill.', price: 120, minQuantity: 100, maxQuantity: 100000, avgStartTime: '1 hour', speed: '5000/day' },
        { name: 'Instagram Followers [Cheapest]', category: 'Instagram', description: 'Budget Instagram followers. No refill.', price: 50, minQuantity: 100, maxQuantity: 500000, avgStartTime: '6 hours', speed: '10000/day' },
        { name: 'Instagram Likes [HQ Profile]', category: 'Instagram', description: 'Instagram post likes from HQ profiles. Instant start.', price: 60, minQuantity: 50, maxQuantity: 500000, avgStartTime: '10 minutes', speed: '20000/day' },
        { name: 'Instagram Likes [Cheapest]', category: 'Instagram', description: 'Budget Instagram likes. Mixed quality.', price: 25, minQuantity: 50, maxQuantity: 1000000, avgStartTime: '1 hour', speed: '50000/day' },
        { name: 'Instagram Views [Reel/Video]', category: 'Instagram', description: 'Instagram reel/video views. Real views. Instant start.', price: 15, minQuantity: 100, maxQuantity: 10000000, avgStartTime: '5 minutes', speed: '100000/day' },
        { name: 'Instagram Views [Story]', category: 'Instagram', description: 'Instagram story views from real accounts.', price: 20, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '10 minutes', speed: '50000/day' },
        { name: 'Instagram Comments [Custom]', category: 'Instagram', description: 'Custom Instagram comments. Write your own.', price: 500, minQuantity: 10, maxQuantity: 5000, avgStartTime: '2 hours', speed: '200/day' },
        { name: 'Instagram Saves', category: 'Instagram', description: 'Instagram post saves. Algorithm boost.', price: 80, minQuantity: 50, maxQuantity: 100000, avgStartTime: '1 hour', speed: '5000/day' },
        { name: 'Instagram Shares', category: 'Instagram', description: 'Instagram post shares.', price: 80, minQuantity: 50, maxQuantity: 100000, avgStartTime: '1 hour', speed: '5000/day' },
        { name: 'TikTok Likes [HQ Profile] [Fast]', category: 'TikTok', description: 'TikTok likes from HQ profiles. No refill. Super instant.', price: 90, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '10 minutes', speed: '100000/day' },
        { name: 'TikTok Likes [Cheapest]', category: 'TikTok', description: 'Budget TikTok likes. No refill.', price: 35, minQuantity: 100, maxQuantity: 2000000, avgStartTime: '1 hour', speed: '50000/day' },
        { name: 'TikTok Followers [HQ]', category: 'TikTok', description: 'TikTok followers HQ. 30-day refill.', price: 150, minQuantity: 100, maxQuantity: 500000, avgStartTime: '12 hours', speed: '5000/day' },
        { name: 'TikTok Followers [Cheapest]', category: 'TikTok', description: 'Budget TikTok followers. No refill.', price: 60, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '24 hours', speed: '10000/day' },
        { name: 'TikTok Views [Real]', category: 'TikTok', description: 'TikTok views from real accounts.', price: 15, minQuantity: 500, maxQuantity: 50000000, avgStartTime: '5 minutes', speed: '500000/day' },
        { name: 'TikTok Views [Cheapest]', category: 'TikTok', description: 'Budget TikTok views.', price: 5, minQuantity: 1000, maxQuantity: 100000000, avgStartTime: '1 hour', speed: '1000000/day' },
        { name: 'TikTok Comments [Custom]', category: 'TikTok', description: 'Custom TikTok comments.', price: 400, minQuantity: 10, maxQuantity: 5000, avgStartTime: '2 hours', speed: '200/day' },
        { name: 'TikTok Shares', category: 'TikTok', description: 'TikTok video shares.', price: 100, minQuantity: 100, maxQuantity: 100000, avgStartTime: '1 hour', speed: '5000/day' },
        { name: 'TikTok Likes + Views [HQ]', category: 'TikTok', description: 'TikTok likes + views combo. HQ accounts.', price: 89, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '10 minutes', speed: '50000/day' },
        { name: 'YouTube Subscribers [Real]', category: 'YouTube', description: 'Real subscribers. 30-day drop guarantee.', price: 300, minQuantity: 100, maxQuantity: 100000, avgStartTime: '24 hours', speed: '2000/day' },
        { name: 'YouTube Subscribers [Cheapest]', category: 'YouTube', description: 'Budget YouTube subscribers.', price: 100, minQuantity: 100, maxQuantity: 500000, avgStartTime: '48 hours', speed: '5000/day' },
        { name: 'YouTube Views [Monetizable]', category: 'YouTube', description: 'YouTube views with retention. Monetizable.', price: 200, minQuantity: 500, maxQuantity: 10000000, avgStartTime: '1 hour', speed: '100000/day' },
        { name: 'YouTube Views [Cheapest]', category: 'YouTube', description: 'Budget YouTube views.', price: 50, minQuantity: 500, maxQuantity: 50000000, avgStartTime: '30 minutes', speed: '500000/day' },
        { name: 'YouTube Likes', category: 'YouTube', description: 'YouTube video likes. No refill.', price: 150, minQuantity: 50, maxQuantity: 500000, avgStartTime: '1 hour', speed: '10000/day' },
        { name: 'YouTube Likes [Cheapest]', category: 'YouTube', description: 'Budget YouTube likes.', price: 60, minQuantity: 50, maxQuantity: 1000000, avgStartTime: '6 hours', speed: '20000/day' },
        { name: 'YouTube Dislikes', category: 'YouTube', description: 'YouTube video dislikes.', price: 200, minQuantity: 10, maxQuantity: 50000, avgStartTime: '2 hours', speed: '2000/day' },
        { name: 'YouTube Watch Hours [Monetization]', category: 'YouTube', description: 'YouTube watch hours for monetization.', price: 5000, minQuantity: 1000, maxQuantity: 5000, avgStartTime: '48 hours', speed: '100 hours/day' },
        { name: 'Facebook Page Likes', category: 'Facebook', description: 'Real Facebook page likes. 30-day refill.', price: 200, minQuantity: 100, maxQuantity: 500000, avgStartTime: '24 hours', speed: '5000/day' },
        { name: 'Facebook Page Likes [Cheapest]', category: 'Facebook', description: 'Budget Facebook page likes.', price: 80, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '48 hours', speed: '10000/day' },
        { name: 'Facebook Post Likes', category: 'Facebook', description: 'Facebook post likes.', price: 50, minQuantity: 50, maxQuantity: 500000, avgStartTime: '1 hour', speed: '10000/day' },
        { name: 'Facebook Followers', category: 'Facebook', description: 'Facebook profile/page followers.', price: 150, minQuantity: 100, maxQuantity: 500000, avgStartTime: '24 hours', speed: '3000/day' },
        { name: 'Facebook Video Views', category: 'Facebook', description: 'Facebook video views.', price: 30, minQuantity: 500, maxQuantity: 10000000, avgStartTime: '30 minutes', speed: '100000/day' },
        { name: 'Facebook Post Shares', category: 'Facebook', description: 'Facebook post shares.', price: 100, minQuantity: 50, maxQuantity: 100000, avgStartTime: '2 hours', speed: '3000/day' },
        { name: 'Telegram Members', category: 'Telegram', description: 'Telegram channel/group members.', price: 80, minQuantity: 100, maxQuantity: 500000, avgStartTime: '6 hours', speed: '10000/day' },
        { name: 'Telegram Members [Cheapest]', category: 'Telegram', description: 'Budget Telegram members.', price: 40, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '12 hours', speed: '20000/day' },
        { name: 'Telegram Post Views', category: 'Telegram', description: 'Telegram channel post views.', price: 15, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '10 minutes', speed: '50000/day' },
        { name: 'Telegram Channel Subscribers', category: 'Telegram', description: 'Telegram channel subscribers. HQ.', price: 120, minQuantity: 100, maxQuantity: 200000, avgStartTime: '6 hours', speed: '5000/day' },
        { name: 'Telegram Post Reactions', category: 'Telegram', description: 'Telegram post reactions.', price: 50, minQuantity: 50, maxQuantity: 100000, avgStartTime: '1 hour', speed: '5000/day' },
        { name: 'Twitter/X Followers [Real]', category: 'Twitter/X', description: 'Twitter followers HQ. 30-day refill.', price: 200, minQuantity: 100, maxQuantity: 100000, avgStartTime: '24 hours', speed: '3000/day' },
        { name: 'Twitter/X Followers [Cheapest]', category: 'Twitter/X', description: 'Budget Twitter followers.', price: 80, minQuantity: 100, maxQuantity: 500000, avgStartTime: '48 hours', speed: '10000/day' },
        { name: 'Twitter/X Likes', category: 'Twitter/X', description: 'Twitter tweet likes. HQ profiles.', price: 100, minQuantity: 50, maxQuantity: 500000, avgStartTime: '1 hour', speed: '10000/day' },
        { name: 'Twitter/X Retweets', category: 'Twitter/X', description: 'Twitter retweets.', price: 150, minQuantity: 50, maxQuantity: 200000, avgStartTime: '2 hours', speed: '5000/day' },
        { name: 'Twitter/X Views', category: 'Twitter/X', description: 'Twitter tweet views.', price: 20, minQuantity: 500, maxQuantity: 10000000, avgStartTime: '30 minutes', speed: '100000/day' },
        { name: 'LinkedIn Connections', category: 'LinkedIn', description: 'LinkedIn profile connections.', price: 500, minQuantity: 50, maxQuantity: 10000, avgStartTime: '24 hours', speed: '500/day' },
        { name: 'LinkedIn Followers [Company]', category: 'LinkedIn', description: 'LinkedIn company page followers.', price: 400, minQuantity: 100, maxQuantity: 50000, avgStartTime: '24 hours', speed: '1000/day' },
        { name: 'LinkedIn Post Likes', category: 'LinkedIn', description: 'LinkedIn post likes.', price: 300, minQuantity: 50, maxQuantity: 50000, avgStartTime: '6 hours', speed: '2000/day' },
        { name: 'Discord Server Members', category: 'Discord', description: 'Discord server members.', price: 100, minQuantity: 100, maxQuantity: 100000, avgStartTime: '6 hours', speed: '5000/day' },
        { name: 'Discord Members [Cheapest]', category: 'Discord', description: 'Budget Discord members.', price: 50, minQuantity: 100, maxQuantity: 500000, avgStartTime: '12 hours', speed: '10000/day' },
        { name: 'Spotify Plays', category: 'Spotify', description: 'Spotify track plays. Real streams.', price: 100, minQuantity: 1000, maxQuantity: 10000000, avgStartTime: '1 hour', speed: '50000/day' },
        { name: 'Spotify Followers', category: 'Spotify', description: 'Spotify artist followers.', price: 200, minQuantity: 100, maxQuantity: 50000, avgStartTime: '24 hours', speed: '1000/day' },
        { name: 'Spotify Monthly Listeners', category: 'Spotify', description: 'Spotify monthly listeners.', price: 300, minQuantity: 500, maxQuantity: 1000000, avgStartTime: '24 hours', speed: '10000/day' },
        { name: 'Pinterest Followers', category: 'Pinterest', description: 'Pinterest account followers.', price: 150, minQuantity: 100, maxQuantity: 100000, avgStartTime: '24 hours', speed: '2000/day' },
        { name: 'Pinterest Repins', category: 'Pinterest', description: 'Pinterest pin repins.', price: 80, minQuantity: 50, maxQuantity: 100000, avgStartTime: '2 hours', speed: '5000/day' },
        { name: 'Pinterest Likes', category: 'Pinterest', description: 'Pinterest pin likes.', price: 60, minQuantity: 50, maxQuantity: 100000, avgStartTime: '2 hours', speed: '5000/day' },
        { name: 'Threads Followers', category: 'Threads', description: 'Threads app followers.', price: 150, minQuantity: 100, maxQuantity: 100000, avgStartTime: '12 hours', speed: '3000/day' },
        { name: 'Threads Likes', category: 'Threads', description: 'Threads post likes.', price: 80, minQuantity: 50, maxQuantity: 200000, avgStartTime: '1 hour', speed: '10000/day' },
        { name: 'Threads Reposts', category: 'Threads', description: 'Threads post reposts.', price: 100, minQuantity: 50, maxQuantity: 100000, avgStartTime: '2 hours', speed: '5000/day' },
        { name: 'Snapchat Story Views', category: 'Snapchat', description: 'Snapchat story views.', price: 50, minQuantity: 500, maxQuantity: 1000000, avgStartTime: '1 hour', speed: '50000/day' },
        { name: 'Snapchat Spotlight Views', category: 'Snapchat', description: 'Snapchat spotlight views.', price: 30, minQuantity: 1000, maxQuantity: 10000000, avgStartTime: '30 minutes', speed: '100000/day' },
        { name: 'Website Traffic [Worldwide]', category: 'Website & SEO', description: 'Real website traffic worldwide.', price: 100, minQuantity: 1000, maxQuantity: 10000000, avgStartTime: '1 hour', speed: '50000/day' },
        { name: 'Website Traffic [Pakistan]', category: 'Website & SEO', description: 'Website traffic from Pakistan.', price: 200, minQuantity: 1000, maxQuantity: 5000000, avgStartTime: '1 hour', speed: '20000/day' },
        { name: 'Google Reviews [5 Star]', category: 'Website & SEO', description: 'Google business 5-star reviews.', price: 500, minQuantity: 1, maxQuantity: 100, avgStartTime: '24 hours', speed: '5/day' },
        { name: 'AI Image Generation', category: 'AI Services', description: 'Custom AI generated images. HD quality.', price: 100, minQuantity: 1, maxQuantity: 100, avgStartTime: '1 hour', speed: '10/day' },
        { name: 'AI Video Generation', category: 'AI Services', description: 'AI generated short videos.', price: 500, minQuantity: 1, maxQuantity: 20, avgStartTime: '6 hours', speed: '5/day' },
        { name: 'AI Content Writing', category: 'AI Services', description: 'AI-powered content writing.', price: 200, minQuantity: 1, maxQuantity: 50, avgStartTime: '2 hours', speed: '10/day' },
        { name: 'AI Logo Design', category: 'AI Services', description: 'AI generated logo designs.', price: 300, minQuantity: 1, maxQuantity: 20, avgStartTime: '2 hours', speed: '5/day' },
      ]
      for (const s of svcs) await prisma.service.create({ data: s })
      console.log(`✅ Seeded ${svcs.length} services`)
    }
    const planCount = await prisma.plan.count()
    if (planCount < 1) {
      const plans = [
        { name: 'YouTube Growth', platform: 'YouTube', description: 'Complete YouTube growth package', price: 1000, duration: 30, views: 10000, subscribers: 500, features: 'Views, Subscribers, Likes' },
        { name: 'Instagram Boost', platform: 'Instagram', description: 'Instagram growth package', price: 500, duration: 30, views: 0, subscribers: 1000, features: 'Followers, Likes' },
        { name: 'TikTok Starter', platform: 'TikTok', description: 'TikTok growth package', price: 750, duration: 30, views: 50000, subscribers: 200, features: 'Views, Followers, Likes' },
      ]
      for (const p of plans) await prisma.plan.create({ data: p })
    }
    console.log('✅ Seeding complete')
  } catch (e: any) {
    console.log('⚠️ Seed skipped:', e.message)
  }
}
seedOnce()

if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })

// Serve uploaded files
app.get('/uploads/:filename', async (c) => {
  const filename = c.req.param('filename')
  const filePath = join(UPLOADS_DIR, filename)
  if (!existsSync(filePath)) return c.json({ error: 'Not found' }, 404)
  const data = readFileSync(filePath)
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf'
  }
  return new Response(data, {
    headers: { 'Content-Type': mimeTypes[ext || 'png'] || 'image/png' }
  })
})

// --- AUTH MIDDLEWARE ---
function authMiddleware(c: any, next: any) {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as any
    c.set('auth', { userId: decoded.userId, tunnelAuthenticated: true })
    c.set('userId', decoded.userId)
    c.set('isAdmin', decoded.isAdmin || false)
    return next()
  } catch { return c.json({ error: 'Invalid token' }, 401) }
}

function adminMiddleware(c: any, next: any) {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as any
    if (!decoded.isAdmin) return c.json({ error: 'Admin access required' }, 403)
    c.set('adminId', decoded.adminId)
    return next()
  } catch { return c.json({ error: 'Invalid token' }, 401) }
}

// --- USER AUTH ---
app.post('/auth/register', async (c) => {
  try {
    const { email, username, password, name } = await c.req.json()
    if (!email || !username || !password) return c.json({ error: 'Email, username and password required' }, 400)
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
    if (existing) return c.json({ error: 'Email or username already exists' }, 409)
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { email, username, passwordHash, name: name || username } })
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
    return c.json({ token, user: { id: user.id, email: user.email, username: user.username, name: user.name, walletBalance: user.walletBalance, status: user.status } })
  } catch (e: any) { return c.json({ error: e.message || 'Registration failed' }, 500) }
})

app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    if (!email || !password) return c.json({ error: 'Email and password required' }, 400)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return c.json({ error: 'Invalid credentials' }, 401)
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return c.json({ error: 'Invalid credentials' }, 401)
    if (user.status !== 'active') return c.json({ error: 'Account suspended' }, 403)
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
    return c.json({ token, user: { id: user.id, email: user.email, username: user.username, name: user.name, walletBalance: user.walletBalance, status: user.status } })
  } catch (e: any) { return c.json({ error: e.message || 'Login failed' }, 500) }
})

app.get('/auth/me', authMiddleware, async (c) => {
  const user = await prisma.user.findUnique({ where: { id: c.get('userId') } })
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name, walletBalance: user.walletBalance, status: user.status, createdAt: user.createdAt } })
})

app.post('/auth/change-password', authMiddleware, async (c) => {
  const { currentPassword, newPassword } = await c.req.json()
  const user = await prisma.user.findUnique({ where: { id: c.get('userId') } })
  if (!user) return c.json({ error: 'User not found' }, 404)
  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) return c.json({ error: 'Current password is incorrect' }, 400)
  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } })
  return c.json({ success: true })
})

// --- ADMIN AUTH ---
const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {}
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

app.post('/admin/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    const key = `${ip}:${username}`
    const attempts = loginAttempts[key]
    if (attempts && attempts.count >= MAX_ATTEMPTS && Date.now() - attempts.lastAttempt < LOCKOUT_MS) {
      const remaining = Math.ceil((LOCKOUT_MS - (Date.now() - attempts.lastAttempt)) / 60000)
      return c.json({ error: `Too many failed attempts. Try again in ${remaining} minutes.` }, 429)
    }
    const admin = await prisma.adminUser.findFirst({ where: { username } })
    if (!admin) {
      loginAttempts[key] = { count: (attempts?.count || 0) + 1, lastAttempt: Date.now() }
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    const valid = await bcrypt.compare(password, admin.passwordHash)
    if (!valid) {
      loginAttempts[key] = { count: (attempts?.count || 0) + 1, lastAttempt: Date.now() }
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    delete loginAttempts[key]
    const token = jwt.sign({ adminId: admin.id, isAdmin: true }, JWT_SECRET, { expiresIn: '30d' })
    return c.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role } })
  } catch (e: any) { return c.json({ error: e.message || 'Login failed' }, 500) }
})

app.get('/admin/me', adminMiddleware, async (c) => {
  const admin = await prisma.adminUser.findUnique({ where: { id: c.get('adminId') } })
  if (!admin) return c.json({ error: 'Admin not found' }, 404)
  return c.json({ admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role } })
})

// --- ADMIN DASHBOARD ---
app.get('/admin/dashboard', adminMiddleware, async (c) => {
  try {
    const [totalUsers, pendingDeposits, approvedDeposits, rejectedDeposits, totalOrders, pendingOrders, processingOrders, completedOrders, totalRevenue, credits, debits] = await Promise.all([
      prisma.user.count(),
      prisma.deposit.aggregate({ _sum: { amount: true }, where: { status: 'pending' } }),
      prisma.deposit.aggregate({ _sum: { amount: true }, where: { status: 'approved' } }),
      prisma.deposit.aggregate({ _sum: { amount: true }, where: { status: 'rejected' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'processing' } }),
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.order.aggregate({ _sum: { amount: true }, where: { status: { in: ['completed', 'processing'] } } }),
      prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { type: 'credit' } }),
      prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { type: 'debit' } }),
    ])
    const totalApprovedDeposits = approvedDeposits._sum.amount || 0
    const totalRejectedDeposits = rejectedDeposits._sum.amount || 0
    const totalCredits = credits._sum.amount || 0
    const totalDebits = debits._sum.amount || 0
    return c.json({
      totalUsers,
      totalDeposits: totalApprovedDeposits,
      pendingDeposits: pendingDeposits._sum.amount || 0,
      approvedDeposits: totalApprovedDeposits,
      rejectedDeposits: totalRejectedDeposits,
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.amount || 0,
      walletActivity: totalCredits - totalDebits,
    })
  } catch (e: any) {
    console.error('[Admin Dashboard Error]', e)
    return c.json({ error: e?.message || 'Failed to load dashboard' }, 500)
  }
})

// --- PAYMENT SETTINGS ---
app.get('/payment-settings', async (c) => {
  let settings = await prisma.paymentSettings.findFirst()
  if (!settings) settings = await prisma.paymentSettings.create({ data: {} })
  return c.json({ settings })
})

app.put('/admin/payment-settings', adminMiddleware, async (c) => {
  const data = await c.req.json()
  let settings = await prisma.paymentSettings.findFirst()
  if (settings) {
    settings = await prisma.paymentSettings.update({ where: { id: settings.id }, data })
  } else {
    settings = await prisma.paymentSettings.create({ data })
  }
  return c.json({ settings })
})

// --- SERVICES ---
app.get('/services', async (c) => {
  const services = await prisma.service.findMany({ where: { status: 'active' }, orderBy: { createdAt: 'desc' } })
  return c.json({ services })
})

app.get('/admin/services', adminMiddleware, async (c) => {
  const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } })
  return c.json({ services })
})

app.post('/admin/services', adminMiddleware, async (c) => {
  const data = await c.req.json()
  const service = await prisma.service.create({ data })
  return c.json({ service })
})

app.put('/admin/services/:id', adminMiddleware, async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()
  const service = await prisma.service.update({ where: { id }, data })
  return c.json({ service })
})

app.delete('/admin/services/:id', adminMiddleware, async (c) => {
  const id = c.req.param('id')
  await prisma.service.delete({ where: { id } })
  return c.json({ success: true })
})

// --- DEPOSITS ---
app.post('/deposits', authMiddleware, async (c) => {
  try {
    const userId = c.get('auth')?.userId || c.get('userId')
    const { amount, method, transactionId, senderInfo, screenshot } = await c.req.json()
    if (!userId) return c.json({ error: 'Please login to submit a deposit' }, 401)
    if (!amount || !method) return c.json({ error: 'Amount and method required' }, 400)
    if (amount <= 0) return c.json({ error: 'Amount must be positive' }, 400)
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return c.json({ error: 'User not found. Please register again or login again.' }, 404)
    const deposit = await prisma.deposit.create({
      data: {
        userId,
        amount: parseFloat(amount),
        method,
        transactionId: transactionId || null,
        senderInfo: senderInfo || null,
        screenshot: screenshot || null
      }
    })
    await prisma.notification.create({
      data: { userId, title: 'Deposit Submitted', message: `Your Rs. ${amount} deposit request has been submitted and is pending review.`, type: 'info' }
    }).catch(() => {})
    return c.json({ deposit })
  } catch (e: any) {
    console.error('[Deposit Error]', e)
    return c.json({ error: 'Failed to submit deposit. Please try again.' }, 500)
  }
})

app.get('/deposits', authMiddleware, async (c) => {
  const deposits = await prisma.deposit.findMany({ where: { userId: c.get('userId') }, orderBy: { createdAt: 'desc' } })
  return c.json({ deposits })
})

app.get('/admin/deposits', adminMiddleware, async (c) => {
  const status = c.req.query('status')
  const where: any = {}
  if (status) where.status = status
  const deposits = await prisma.deposit.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, username: true, email: true, name: true } } }
  })
  return c.json({ deposits })
})

app.post('/admin/deposits/:id/approve', adminMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const adminId = c.get('adminId')
    const deposit = await prisma.deposit.findUnique({ where: { id } })
    if (!deposit) return c.json({ error: 'Deposit not found' }, 404)
    if (deposit.status !== 'pending') return c.json({ error: 'Deposit already processed' }, 400)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: deposit.userId } })
      if (!user) throw new Error('User not found')
      const prevBalance = user.walletBalance
      const newBalance = prevBalance + deposit.amount

      await tx.user.update({ where: { id: deposit.userId }, data: { walletBalance: newBalance } })
      await tx.deposit.update({ where: { id }, data: { status: 'approved', reviewedBy: adminId, reviewedAt: new Date() } })
      const txn = await tx.walletTransaction.create({
        data: {
          userId: deposit.userId, type: 'credit', amount: deposit.amount,
          previousBalance: prevBalance, newBalance, description: `Deposit via ${deposit.method}`,
          depositId: deposit.id, status: 'completed'
        }
      })
      await tx.notification.create({
        data: {
          userId: deposit.userId, title: 'Deposit Approved',
          message: `Your Rs. ${deposit.amount} deposit has been approved and credited to your wallet.`,
          type: 'success'
        }
      }).catch(() => {})
      return { txn, newBalance }
    })
    return c.json({ success: true, newBalance: result.newBalance })
  } catch (e: any) {
    console.error('[Approve Deposit Error]', e)
    return c.json({ error: e?.message || 'Failed to approve deposit' }, 500)
  }
})

app.post('/admin/deposits/:id/reject', adminMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const adminId = c.get('adminId')
    const { reason } = await c.req.json().catch(() => ({}))
    const deposit = await prisma.deposit.findUnique({ where: { id } })
    if (!deposit) return c.json({ error: 'Deposit not found' }, 404)
    if (deposit.status !== 'pending') return c.json({ error: 'Deposit already processed' }, 400)
    await prisma.deposit.update({ where: { id }, data: { status: 'rejected', reviewedBy: adminId, reviewedAt: new Date() } })
    await prisma.notification.create({
      data: {
        userId: deposit.userId, title: 'Deposit Rejected',
        message: `Your Rs. ${deposit.amount} deposit request has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'error'
      }
    }).catch(() => {})
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e?.message || 'Failed to reject deposit' }, 500) }
})

// --- ORDERS ---
app.post('/orders', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const { serviceId, link, quantity } = await c.req.json()
    if (!serviceId || !link || !quantity) return c.json({ error: 'Service, link and quantity required' }, 400)

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) return c.json({ error: 'Service not found' }, 404)
    if (service.status !== 'active') return c.json({ error: 'Service is not available' }, 400)
    if (quantity < service.minQuantity || quantity > service.maxQuantity) {
      return c.json({ error: `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}` }, 400)
    }

    const amount = parseFloat((service.price * quantity).toFixed(2))
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return c.json({ error: 'User not found' }, 404)
    if (user.walletBalance < amount) return c.json({ error: 'Insufficient balance. Please add funds.' }, 400)

    const order = await prisma.order.create({
      data: { userId, serviceId, link, quantity, amount, status: 'pending' }
    })
    await prisma.notification.create({
      data: { userId, title: 'Order Submitted', message: `Order #${order.id.slice(-6).toUpperCase()} for ${service.name} has been submitted.`, type: 'info' }
    })
    return c.json({ order, balanceAfter: user.walletBalance - amount })
  } catch (e: any) { return c.json({ error: e.message || 'Failed to create order' }, 500) }
})

app.get('/orders', authMiddleware, async (c) => {
  const orders = await prisma.order.findMany({
    where: { userId: c.get('userId') }, orderBy: { createdAt: 'desc' },
    include: { service: { select: { name: true, category: true } } }
  })
  return c.json({ orders })
})

app.get('/admin/orders', adminMiddleware, async (c) => {
  const status = c.req.query('status')
  const where: any = {}
  if (status) where.status = status
  const orders = await prisma.order.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { service: { select: { name: true, category: true } }, user: { select: { id: true, username: true, email: true } } }
  })
  return c.json({ orders })
})

app.post('/admin/orders/:id/start', adminMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const adminId = c.get('adminId')
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return c.json({ error: 'Order not found' }, 404)
    if (order.status !== 'pending') return c.json({ error: 'Order already processed' }, 400)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: order.userId } })
      if (!user) throw new Error('User not found')
      if (user.walletBalance < order.amount) throw new Error('Insufficient wallet balance')

      const prevBalance = user.walletBalance
      const newBalance = prevBalance - order.amount

      await tx.user.update({ where: { id: order.userId }, data: { walletBalance: newBalance } })
      await tx.order.update({ where: { id }, data: { status: 'processing', approvedBy: adminId } })
      await tx.walletTransaction.create({
        data: {
          userId: order.userId, type: 'debit', amount: order.amount,
          previousBalance: prevBalance, newBalance, description: `Order #${order.id.slice(-6).toUpperCase()} - ${order.link}`,
          orderId: order.id, status: 'completed'
        }
      })
      await tx.notification.create({
        data: {
          userId: order.userId, title: 'Order Processing',
          message: `Your order #${order.id.slice(-6).toUpperCase()} has been approved and is now processing.`,
          type: 'success'
        }
      }).catch(() => {})
      return { newBalance }
    })
    return c.json({ success: true, newBalance: result.newBalance })
  } catch (e: any) { return c.json({ error: e?.message || 'Failed to start order' }, 500) }
})

app.post('/admin/orders/:id/complete', adminMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return c.json({ error: 'Order not found' }, 404)
    if (order.status !== 'processing') return c.json({ error: 'Order must be in processing status' }, 400)

    await prisma.order.update({ where: { id }, data: { status: 'completed', completedAt: new Date() } })
    await prisma.notification.create({
      data: {
        userId: order.userId, title: 'Order Completed',
        message: `Your order #${order.id.slice(-6).toUpperCase()} has been completed successfully!`,
        type: 'success'
      }
    }).catch(() => {})
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e?.message || 'Failed to complete order' }, 500) }
})

app.post('/admin/orders/:id/cancel', adminMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const { refund } = await c.req.json().catch(() => ({ refund: false }))
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return c.json({ error: 'Order not found' }, 404)

    const result = await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: { status: 'cancelled' } })

      if (refund && order.status === 'processing') {
        const user = await tx.user.findUnique({ where: { id: order.userId } })
        if (user) {
          const prevBalance = user.walletBalance
          const newBalance = prevBalance + order.amount
          await tx.user.update({ where: { id: order.userId }, data: { walletBalance: newBalance } })
          await tx.walletTransaction.create({
            data: {
              userId: order.userId, type: 'credit', amount: order.amount,
              previousBalance: prevBalance, newBalance, description: `Refund - Order #${order.id.slice(-6).toUpperCase()}`,
              orderId: order.id, status: 'completed'
            }
          })
        }
      }

      await tx.notification.create({
        data: {
          userId: order.userId, title: 'Order Cancelled',
          message: `Your order #${order.id.slice(-6).toUpperCase()} has been cancelled.${refund ? ' A refund has been processed.' : ''}`,
          type: 'error'
        }
      }).catch(() => {})
      return true
    })
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e?.message || 'Failed to cancel order' }, 500) }
})

// --- WALLET TRANSACTIONS ---
app.get('/wallet-transactions', authMiddleware, async (c) => {
  const transactions = await prisma.walletTransaction.findMany({
    where: { userId: c.get('userId') }, orderBy: { createdAt: 'desc' }
  })
  return c.json({ transactions })
})

app.get('/admin/wallet-transactions', adminMiddleware, async (c) => {
  const transactions = await prisma.walletTransaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, username: true, email: true } },
      deposit: { select: { id: true, amount: true, method: true, transactionId: true, senderInfo: true, status: true, screenshot: true, reviewedAt: true } },
      order: { select: { id: true, link: true, amount: true, status: true } }
    }
  })
  return c.json({ transactions })
})

// --- NOTIFICATIONS ---
app.get('/notifications', authMiddleware, async (c) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: c.get('userId') }, orderBy: { createdAt: 'desc' }, take: 50
  })
  return c.json({ notifications })
})

app.put('/notifications/:id/read', authMiddleware, async (c) => {
  const id = c.req.param('id')
  await prisma.notification.update({ where: { id }, data: { readStatus: true } })
  return c.json({ success: true })
})

app.post('/notifications/read-all', authMiddleware, async (c) => {
  await prisma.notification.updateMany({ where: { userId: c.get('userId'), readStatus: false }, data: { readStatus: true } })
  return c.json({ success: true })
})

// --- SUPPORT TICKETS ---
app.post('/support-tickets', authMiddleware, async (c) => {
  const { subject, message } = await c.req.json()
  const ticket = await prisma.supportTicket.create({ data: { userId: c.get('userId'), subject, message } })
  return c.json({ ticket })
})

app.get('/support-tickets', authMiddleware, async (c) => {
  const tickets = await prisma.supportTicket.findMany({ where: { userId: c.get('userId') }, orderBy: { createdAt: 'desc' } })
  return c.json({ tickets })
})

app.get('/admin/support-tickets', adminMiddleware, async (c) => {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, username: true, email: true } } }
  })
  return c.json({ tickets })
})

app.post('/admin/support-tickets/:id/reply', adminMiddleware, async (c) => {
  const id = c.req.param('id')
  const { reply, status } = await c.req.json()
  await prisma.supportTicket.update({ where: { id }, data: { reply, status: status || 'replied' } })
  const ticket = await prisma.supportTicket.findUnique({ where: { id } })
  if (ticket) {
    await prisma.notification.create({
      data: {
        userId: ticket.userId, title: 'Support Reply',
        message: `Admin replied to your ticket: ${ticket.subject}`,
        type: 'info'
      }
    })
  }
  return c.json({ success: true })
})

// --- PLANS ---
app.get('/plans', async (c) => {
  const plans = await prisma.plan.findMany({ where: { status: 'active' }, orderBy: { createdAt: 'desc' } })
  return c.json({ plans })
})

app.get('/admin/plans', adminMiddleware, async (c) => {
  const plans = await prisma.plan.findMany({ orderBy: { createdAt: 'desc' } })
  return c.json({ plans })
})

app.post('/admin/plans', adminMiddleware, async (c) => {
  const data = await c.req.json()
  const plan = await prisma.plan.create({ data })
  return c.json({ plan })
})

app.put('/admin/plans/:id', adminMiddleware, async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()
  const plan = await prisma.plan.update({ where: { id }, data })
  return c.json({ plan })
})

app.delete('/admin/plans/:id', adminMiddleware, async (c) => {
  await prisma.plan.delete({ where: { id: c.req.param('id') } })
  return c.json({ success: true })
})

// --- USER PLANS ---
app.get('/user-plans', authMiddleware, async (c) => {
  const userPlans = await prisma.userPlan.findMany({
    where: { userId: c.get('userId') },
    include: { plan: true },
    orderBy: { createdAt: 'desc' }
  })
  return c.json({ userPlans })
})

app.post('/user-plans', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const { planId } = await c.req.json()
  const plan = await prisma.plan.findUnique({ where: { id: planId } })
  if (!plan) return c.json({ error: 'Plan not found' }, 404)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.walletBalance < plan.price) return c.json({ error: 'Insufficient balance' }, 400)

  const existing = await prisma.userPlan.findUnique({ where: { userId_planId: { userId, planId } } })
  if (existing && existing.status === 'active') return c.json({ error: 'Plan already active' }, 400)

  const result = await prisma.$transaction(async (tx) => {
    const prevBalance = user!.walletBalance
    const newBalance = prevBalance - plan.price
    await tx.user.update({ where: { id: userId }, data: { walletBalance: newBalance } })
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.duration)
    const userPlan = await tx.userPlan.upsert({
      where: { userId_planId: { userId, planId } },
      create: { userId, planId, status: 'active', startDate: new Date(), endDate },
      update: { status: 'active', startDate: new Date(), endDate }
    })
    await tx.walletTransaction.create({
      data: {
        userId, type: 'debit', amount: plan.price,
        previousBalance, newBalance, description: `Plan purchase: ${plan.name}`,
        status: 'completed'
      }
    })
    await tx.notification.create({
      data: { userId, title: 'Plan Purchased', message: `You have purchased the ${plan.name} plan for Rs. ${plan.price}.`, type: 'success' }
    })
    return userPlan
  })
  return c.json({ userPlan: result })
})

// --- ADMIN USER MANAGEMENT ---
app.get('/admin/users', adminMiddleware, async (c) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, username: true, name: true, walletBalance: true, status: true, createdAt: true }
  })
  return c.json({ users })
})

app.get('/admin/users/:id', adminMiddleware, async (c) => {
  const user = await prisma.user.findUnique({
    where: { id: c.req.param('id') },
    select: { id: true, email: true, username: true, name: true, walletBalance: true, status: true, createdAt: true }
  })
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json({ user })
})

app.put('/admin/users/:id', adminMiddleware, async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 12)
    delete data.password
  }
  const user = await prisma.user.update({ where: { id }, data, select: { id: true, email: true, username: true, name: true, walletBalance: true, status: true } })
  return c.json({ user })
})

app.post('/admin/users/:id/adjust-balance', adminMiddleware, async (c) => {
  try {
    const userId = c.req.param('id')
    const { amount, type, description } = await c.req.json()

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } })
      if (!user) throw new Error('User not found')
      const prevBalance = user.walletBalance
      const newBalance = type === 'credit' ? prevBalance + Math.abs(amount) : prevBalance - Math.abs(amount)
      if (newBalance < 0) throw new Error('Insufficient balance')
      await tx.user.update({ where: { id: userId }, data: { walletBalance: newBalance } })
      await tx.walletTransaction.create({
        data: {
          userId, type, amount: Math.abs(amount), previousBalance: prevBalance, newBalance,
          description: description || `Admin ${type}`, status: 'completed'
        }
      })
      return newBalance
    })
    return c.json({ success: true, newBalance: result })
  } catch (e: any) {
    console.error('[Adjust Balance Error]', e)
    return c.json({ error: e?.message || 'Failed to adjust balance' }, 500)
  }
})

// --- BACKUP & RESTORE ---
app.get('/admin/backup/export', adminMiddleware, async (c) => {
  try {
    const [users, adminUsers, paymentSettings, services, deposits, orders, walletTransactions, notifications, supportTickets, plans, userPlans] = await Promise.all([
      prisma.user.findMany(),
      prisma.adminUser.findMany(),
      prisma.paymentSettings.findMany(),
      prisma.service.findMany(),
      prisma.deposit.findMany(),
      prisma.order.findMany(),
      prisma.walletTransaction.findMany(),
      prisma.notification.findMany(),
      prisma.supportTicket.findMany(),
      prisma.plan.findMany(),
      prisma.userPlan.findMany(),
    ])
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      counts: {
        users: users.length,
        adminUsers: adminUsers.length,
        services: services.length,
        deposits: deposits.length,
        orders: orders.length,
        walletTransactions: walletTransactions.length,
        notifications: notifications.length,
        supportTickets: supportTickets.length,
        plans: plans.length,
        userPlans: userPlans.length,
      },
      data: {
        users,
        adminUsers,
        paymentSettings,
        services,
        deposits,
        orders,
        walletTransactions,
        notifications,
        supportTickets,
        plans,
        userPlans,
      }
    }
    return c.json(backup)
  } catch (e: any) {
    console.error('[Backup Export Error]', e)
    return c.json({ error: e?.message || 'Failed to export backup' }, 500)
  }
})

app.post('/admin/backup/import', adminMiddleware, async (c) => {
  try {
    const backup = await c.req.json()
    if (!backup?.data) return c.json({ error: 'Invalid backup file format' }, 400)

    const { data } = backup
    const results: Record<string, number> = {}

    await prisma.$transaction(async (tx) => {
      // Delete in reverse dependency order
      await tx.userPlan.deleteMany()
      await tx.walletTransaction.deleteMany()
      await tx.notification.deleteMany()
      await tx.order.deleteMany()
      await tx.deposit.deleteMany()
      await tx.supportTicket.deleteMany()
      await tx.user.deleteMany()
      await tx.adminUser.deleteMany()
      await tx.service.deleteMany()
      await tx.plan.deleteMany()
      await tx.paymentSettings.deleteMany()

      // Insert in dependency order
      if (data.services?.length) {
        await tx.service.createMany({ data: data.services.map((s: any) => ({ ...s, createdAt: s.createdAt ? new Date(s.createdAt) : undefined })) })
        results.services = data.services.length
      }
      if (data.plans?.length) {
        await tx.plan.createMany({ data: data.plans.map((p: any) => ({ ...p, createdAt: p.createdAt ? new Date(p.createdAt) : undefined })) })
        results.plans = data.plans.length
      }
      if (data.paymentSettings?.length) {
        await tx.paymentSettings.createMany({ data: data.paymentSettings.map((ps: any) => ({ ...ps, updatedAt: ps.updatedAt ? new Date(ps.updatedAt) : undefined })) })
        results.paymentSettings = data.paymentSettings.length
      }
      if (data.users?.length) {
        await tx.user.createMany({ data: data.users.map((u: any) => ({ ...u, createdAt: u.createdAt ? new Date(u.createdAt) : undefined, updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined })) })
        results.users = data.users.length
      }
      if (data.adminUsers?.length) {
        await tx.adminUser.createMany({ data: data.adminUsers.map((a: any) => ({ ...a, createdAt: a.createdAt ? new Date(a.createdAt) : undefined })) })
        results.adminUsers = data.adminUsers.length
      }
      if (data.deposits?.length) {
        await tx.deposit.createMany({ data: data.deposits.map((d: any) => ({ ...d, createdAt: d.createdAt ? new Date(d.createdAt) : undefined, reviewedAt: d.reviewedAt ? new Date(d.reviewedAt) : undefined })) })
        results.deposits = data.deposits.length
      }
      if (data.orders?.length) {
        await tx.order.createMany({ data: data.orders.map((o: any) => ({ ...o, createdAt: o.createdAt ? new Date(o.createdAt) : undefined, completedAt: o.completedAt ? new Date(o.completedAt) : undefined })) })
        results.orders = data.orders.length
      }
      if (data.supportTickets?.length) {
        await tx.supportTicket.createMany({ data: data.supportTickets.map((st: any) => ({ ...st, createdAt: st.createdAt ? new Date(st.createdAt) : undefined, updatedAt: st.updatedAt ? new Date(st.updatedAt) : undefined })) })
        results.supportTickets = data.supportTickets.length
      }
      if (data.walletTransactions?.length) {
        await tx.walletTransaction.createMany({ data: data.walletTransactions.map((w: any) => ({ ...w, createdAt: w.createdAt ? new Date(w.createdAt) : undefined })) })
        results.walletTransactions = data.walletTransactions.length
      }
      if (data.notifications?.length) {
        await tx.notification.createMany({ data: data.notifications.map((n: any) => ({ ...n, createdAt: n.createdAt ? new Date(n.createdAt) : undefined })) })
        results.notifications = data.notifications.length
      }
      if (data.userPlans?.length) {
        await tx.userPlan.createMany({ data: data.userPlans.map((up: any) => ({ ...up, createdAt: up.createdAt ? new Date(up.createdAt) : undefined, startDate: up.startDate ? new Date(up.startDate) : undefined, endDate: up.endDate ? new Date(up.endDate) : undefined })) })
        results.userPlans = data.userPlans.length
      }
    })

    return c.json({ success: true, message: 'Backup restored successfully', results })
  } catch (e: any) {
    console.error('[Backup Import Error]', e)
    return c.json({ error: e?.message || 'Failed to restore backup' }, 500)
  }
})

// --- SEED DEFAULT DATA ---
app.post('/admin/seed', async (c) => {
  const { adminPassword } = await c.req.json().catch(() => ({}))
  const existing = await prisma.adminUser.findFirst()
  if (existing) return c.json({ message: 'Already seeded' })

  const adminHash = await bcrypt.hash(adminPassword || 'admin123', 12)
  await prisma.adminUser.create({
    data: { username: 'admin', email: 'admin@smmpanel.com', passwordHash: adminHash, role: 'superadmin' }
  })
  await prisma.paymentSettings.create({ data: {} })

  // Seed some services
  const services = [
    { name: 'Instagram Followers', category: 'Instagram', description: 'Real Instagram followers', price: 0.5, minQuantity: 100, maxQuantity: 100000, avgStartTime: '1-2 hours', speed: '1000/day' },
    { name: 'Instagram Likes', category: 'Instagram', description: 'High quality Instagram likes', price: 0.3, minQuantity: 50, maxQuantity: 50000, avgStartTime: '30 min', speed: '5000/day' },
    { name: 'Instagram Views', category: 'Instagram', description: 'Instagram reel/story views', price: 0.1, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '15 min', speed: '50000/day' },
    { name: 'YouTube Subscribers', category: 'YouTube', description: 'Real YouTube subscribers', price: 5.0, minQuantity: 100, maxQuantity: 50000, avgStartTime: '24 hours', speed: '500/day' },
    { name: 'YouTube Views', category: 'YouTube', description: 'YouTube video views', price: 0.5, minQuantity: 500, maxQuantity: 1000000, avgStartTime: '1 hour', speed: '10000/day' },
    { name: 'YouTube Likes', category: 'YouTube', description: 'YouTube video likes', price: 1.0, minQuantity: 50, maxQuantity: 100000, avgStartTime: '2 hours', speed: '2000/day' },
    { name: 'TikTok Followers', category: 'TikTok', description: 'Real TikTok followers', price: 1.0, minQuantity: 100, maxQuantity: 100000, avgStartTime: '12 hours', speed: '1000/day' },
    { name: 'TikTok Likes', category: 'TikTok', description: 'TikTok video likes', price: 0.5, minQuantity: 100, maxQuantity: 500000, avgStartTime: '1 hour', speed: '10000/day' },
    { name: 'Facebook Page Likes', category: 'Facebook', description: 'Real Facebook page likes', price: 2.0, minQuantity: 100, maxQuantity: 100000, avgStartTime: '24 hours', speed: '500/day' },
    { name: 'Twitter Followers', category: 'Twitter/X', description: 'Twitter/X followers', price: 1.5, minQuantity: 100, maxQuantity: 50000, avgStartTime: '12 hours', speed: '500/day' },
    { name: 'Telegram Members', category: 'Telegram', description: 'Telegram group/channel members', price: 1.0, minQuantity: 100, maxQuantity: 100000, avgStartTime: '6 hours', speed: '1000/day' },
  ]
  for (const s of services) {
    await prisma.service.create({ data: s })
  }

  // Seed plans
  const plans = [
    { name: 'YouTube Growth', platform: 'YouTube', description: 'Complete YouTube growth package', price: 1000, duration: 30, views: 10000, subscribers: 500, features: 'Views, Subscribers, Likes' },
    { name: 'Instagram Boost', platform: 'Instagram', description: 'Instagram growth package', price: 500, duration: 30, views: 0, subscribers: 1000, features: 'Followers, Likes' },
    { name: 'TikTok Starter', platform: 'TikTok', description: 'TikTok growth package', price: 750, duration: 30, views: 50000, subscribers: 200, features: 'Views, Followers, Likes' },
  ]
  for (const p of plans) {
    await prisma.plan.create({ data: p })
  }

  return c.json({ message: 'Seeded successfully', admin: { username: 'admin', password: adminPassword || 'admin123' } })
})

// --- SITE SETTINGS (Public read, Admin write) ---
app.get('/site-settings', async (c) => {
  try {
    const rows = await prisma.$queryRaw`SELECT * FROM site_settings LIMIT 1` as any[]
    if (rows && rows.length > 0) {
      return c.json({ settings: rows[0] })
    }
    // Create default settings
    await prisma.$executeRaw`INSERT OR IGNORE INTO site_settings (id, site_name, site_tagline, admin_name, admin_phone, admin_email, admin_whatsapp, instagram, youtube, facebook, twitter, telegram, updated_at) VALUES ('default', 'PAK BOOSTER', 'Social Services', 'Waseem Abbas', '03479178048', '', '', '', '', '', '', '', datetime('now'))`
    const rows2 = await prisma.$queryRaw`SELECT * FROM site_settings LIMIT 1` as any[]
    return c.json({ settings: rows2?.[0] || { siteName: 'PAK BOOSTER', siteTagline: 'Social Services', adminName: 'Waseem Abbas', adminPhone: '03479178048' } })
  } catch (e: any) {
    console.error('[Site Settings GET Error]', e.message)
    return c.json({ settings: { siteName: 'PAK BOOSTER', siteTagline: 'Social Services', adminName: 'Waseem Abbas', adminPhone: '03479178048', adminEmail: '', adminWhatsapp: '', instagram: '', youtube: '', facebook: '', twitter: '', telegram: '' } })
  }
})

app.put('/admin/site-settings', adminMiddleware, async (c) => {
  try {
    const data = await c.req.json()
    const existing = await prisma.$queryRaw`SELECT id FROM site_settings LIMIT 1` as any[]
    if (existing && existing.length > 0) {
      await prisma.$executeRaw`UPDATE site_settings SET site_name=${data.siteName || 'PAK BOOSTER'}, site_tagline=${data.siteTagline || ''}, admin_name=${data.adminName || ''}, admin_phone=${data.adminPhone || ''}, admin_email=${data.adminEmail || ''}, admin_whatsapp=${data.adminWhatsapp || ''}, instagram=${data.instagram || ''}, youtube=${data.youtube || ''}, facebook=${data.facebook || ''}, twitter=${data.twitter || ''}, telegram=${data.telegram || ''}, updated_at=datetime('now') WHERE id=${existing[0].id}`
    } else {
      await prisma.$executeRaw`INSERT INTO site_settings (id, site_name, site_tagline, admin_name, admin_phone, admin_email, admin_whatsapp, instagram, youtube, facebook, twitter, telegram, updated_at) VALUES ('default', ${data.siteName || 'PAK BOOSTER'}, ${data.siteTagline || ''}, ${data.adminName || ''}, ${data.adminPhone || ''}, ${data.adminEmail || ''}, ${data.adminWhatsapp || ''}, ${data.instagram || ''}, ${data.youtube || ''}, ${data.facebook || ''}, ${data.twitter || ''}, ${data.telegram || ''}, datetime('now'))`
    }
    const updated = await prisma.$queryRaw`SELECT * FROM site_settings LIMIT 1` as any[]
    return c.json({ settings: updated?.[0] || data })
  } catch (e: any) {
    console.error('[Site Settings PUT Error]', e.message)
    return c.json({ error: e?.message || 'Failed to update settings' }, 500)
  }
})

// --- ADMIN CREDENTIAL UPDATE ---
app.put('/admin/change-credentials', adminMiddleware, async (c) => {
  try {
    const adminId = c.get('adminId')
    const { currentPassword, newUsername, newPassword, email } = await c.req.json()
    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } })
    if (!admin) return c.json({ error: 'Admin not found' }, 404)

    if (currentPassword) {
      const valid = await bcrypt.compare(currentPassword, admin.passwordHash)
      if (!valid) return c.json({ error: 'Current password is incorrect' }, 400)
    }

    const updateData: any = {}
    if (newUsername && newUsername !== admin.username) {
      const exists = await prisma.adminUser.findFirst({ where: { username: newUsername, id: { not: adminId } } })
      if (exists) return c.json({ error: 'Username already taken' }, 409)
      updateData.username = newUsername
    }
    if (newPassword) {
      updateData.passwordHash = await bcrypt.hash(newPassword, 12)
    }
    if (email) {
      updateData.email = email
    }

    if (Object.keys(updateData).length === 0) return c.json({ error: 'Nothing to update' }, 400)

    const updated = await prisma.adminUser.update({ where: { id: adminId }, data: updateData })

    // If credentials changed, issue new token
    const newToken = jwt.sign({ adminId: updated.id, isAdmin: true }, JWT_SECRET, { expiresIn: '30d' })
    return c.json({
      success: true,
      token: newToken,
      admin: { id: updated.id, username: updated.username, email: updated.email, role: updated.role }
    })
  } catch (e: any) {
    return c.json({ error: e?.message || 'Failed to update credentials' }, 500)
  }
})

export default app
