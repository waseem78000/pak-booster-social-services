import { Hono } from 'hono'
import { prisma } from './src/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const app = new Hono()
const JWT_SECRET = process.env.JWT_SECRET || 'smm-panel-secret-key-2026'
const UPLOADS_DIR = join(process.cwd(), 'uploads')

// --- HEALTH CHECK ---
app.get('/health', (c) => {
  return c.json({ ok: true, timestamp: new Date().toISOString() })
})

// --- AUTO-SEED (runs once on startup) ---
const seedOnce = async () => {
  try {
    const existing = await prisma.adminUser.findFirst()
    if (existing) return
    console.log('🌱 Seeding default admin...')
    const adminHash = await bcrypt.hash('admin123', 12)
    await prisma.adminUser.create({
      data: { username: 'admin', email: 'admin@smmpanel.com', passwordHash: adminHash, role: 'superadmin' }
    })
    await prisma.paymentSettings.create({ data: {} })
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
    for (const s of services) await prisma.service.create({ data: s })
    const plans = [
      { name: 'YouTube Growth', platform: 'YouTube', description: 'Complete YouTube growth package', price: 1000, duration: 30, views: 10000, subscribers: 500, features: 'Views, Subscribers, Likes' },
      { name: 'Instagram Boost', platform: 'Instagram', description: 'Instagram growth package', price: 500, duration: 30, views: 0, subscribers: 1000, features: 'Followers, Likes' },
      { name: 'TikTok Starter', platform: 'TikTok', description: 'TikTok growth package', price: 750, duration: 30, views: 50000, subscribers: 200, features: 'Views, Followers, Likes' },
    ]
    for (const p of plans) await prisma.plan.create({ data: p })
    console.log('✅ Seeded admin (admin/admin123) + services + plans')
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
app.post('/admin/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    const admin = await prisma.adminUser.findFirst({ where: { username } })
    if (!admin) return c.json({ error: 'Invalid credentials' }, 401)
    const valid = await bcrypt.compare(password, admin.passwordHash)
    if (!valid) return c.json({ error: 'Invalid credentials' }, 401)
    const token = jwt.sign({ adminId: admin.id, isAdmin: true }, JWT_SECRET, { expiresIn: '7d' })
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
  const [totalUsers, totalDeposits, pendingDeposits, approvedDeposits, totalOrders, pendingOrders, processingOrders, completedOrders, totalRevenue, walletTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.deposit.aggregate({ _sum: { amount: true } }),
    prisma.deposit.aggregate({ _sum: { amount: true }, where: { status: 'pending' } }),
    prisma.deposit.aggregate({ _sum: { amount: true }, where: { status: 'approved' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.count({ where: { status: 'processing' } }),
    prisma.order.count({ where: { status: 'completed' } }),
    prisma.order.aggregate({ _sum: { amount: true }, where: { status: { in: ['completed', 'processing'] } } }),
    prisma.walletTransaction.aggregate({ _sum: { amount: true } }),
  ])
  return c.json({
    totalUsers,
    totalDeposits: totalDeposits._sum.amount || 0,
    pendingDeposits: pendingDeposits._sum.amount || 0,
    approvedDeposits: approvedDeposits._sum.amount || 0,
    totalOrders,
    pendingOrders,
    processingOrders,
    completedOrders,
    totalRevenue: totalRevenue._sum.amount || 0,
    walletActivity: walletTransactions._sum.amount || 0,
  })
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
    const userId = c.get('userId')
    const { amount, method, transactionId, senderInfo, screenshot } = await c.req.json()
    if (!amount || !method) return c.json({ error: 'Amount and method required' }, 400)
    if (amount <= 0) return c.json({ error: 'Amount must be positive' }, 400)
    const deposit = await prisma.deposit.create({
      data: { userId, amount: parseFloat(amount), method, transactionId, senderInfo, screenshot }
    })
    await prisma.notification.create({
      data: { userId, title: 'Deposit Submitted', message: `Your Rs. ${amount} deposit request has been submitted and is pending review.`, type: 'info' }
    })
    return c.json({ deposit })
  } catch (e: any) { return c.json({ error: e.message || 'Failed to submit deposit' }, 500) }
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
        previousBalance, newBalance, description: `Deposit via ${deposit.method}`,
        depositId: deposit.id, status: 'completed'
      }
    })
    await tx.notification.create({
      data: {
        userId: deposit.userId, title: 'Deposit Approved',
        message: `Your Rs. ${deposit.amount} deposit has been approved and credited to your wallet.`,
        type: 'success'
      }
    })
    return { txn, newBalance }
  })
  return c.json({ success: true, newBalance: result.newBalance })
})

app.post('/admin/deposits/:id/reject', adminMiddleware, async (c) => {
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
  })
  return c.json({ success: true })
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
        previousBalance, newBalance, description: `Order #${order.id.slice(-6).toUpperCase()} - ${order.link}`,
        orderId: order.id, status: 'completed'
      }
    })
    await tx.notification.create({
      data: {
        userId: order.userId, title: 'Order Processing',
        message: `Your order #${order.id.slice(-6).toUpperCase()} has been approved and is now processing.`,
        type: 'success'
      }
    })
    return { newBalance }
  })
  return c.json({ success: true, newBalance: result.newBalance })
})

app.post('/admin/orders/:id/complete', adminMiddleware, async (c) => {
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
  })
  return c.json({ success: true })
})

app.post('/admin/orders/:id/cancel', adminMiddleware, async (c) => {
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
            previousBalance, newBalance, description: `Refund - Order #${order.id.slice(-6).toUpperCase()}`,
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
    })
    return true
  })
  return c.json({ success: true })
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
    include: { user: { select: { id: true, username: true } } }
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
        userId, type, amount: Math.abs(amount), previousBalance, newBalance,
        description: description || `Admin ${type}`, status: 'completed'
      }
    })
    return newBalance
  })
  return c.json({ success: true, newBalance: result })
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

export default app
