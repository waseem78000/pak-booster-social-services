const BASE = (import.meta as any).env?.VITE_API_URL || '/api'

function getToken(): string | null {
  return localStorage.getItem('smm_token')
}

function getAdminToken(): string | null {
  return localStorage.getItem('smm_admin_token')
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const adminToken = getAdminToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`
  else if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) {
    const errMsg = typeof data.error === 'string' ? data.error
      : typeof data.error === 'object' && data.error !== null ? (data.error.message || data.error.error || JSON.stringify(data.error))
      : `Request failed (${res.status})`
    throw new Error(errMsg)
  }
  return data
}

export const api = {
  // Auth
  register: (d: { email: string; username: string; password: string; name?: string }) => request('/auth/register', { method: 'POST', body: JSON.stringify(d) }),
  login: (d: { email: string; password: string }) => request('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
  getMe: () => request('/auth/me'),
  changePassword: (d: { currentPassword: string; newPassword: string }) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(d) }),

  // Admin Auth
  adminLogin: (d: { username: string; password: string }) => request('/admin/login', { method: 'POST', body: JSON.stringify(d) }),
  adminMe: () => request('/admin/me'),
  seedAdmin: (d?: { adminPassword?: string }) => request('/admin/seed', { method: 'POST', body: JSON.stringify(d || {}) }),

  // Admin Dashboard
  adminDashboard: () => request('/admin/dashboard'),

  // Payment Settings
  getPaymentSettings: () => request('/payment-settings'),
  updatePaymentSettings: (d: any) => request('/admin/payment-settings', { method: 'PUT', body: JSON.stringify(d) }),

  // Services
  getServices: () => request('/services'),
  getAdminServices: () => request('/admin/services'),
  createService: (d: any) => request('/admin/services', { method: 'POST', body: JSON.stringify(d) }),
  updateService: (id: string, d: any) => request(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteService: (id: string) => request(`/admin/services/${id}`, { method: 'DELETE' }),

  // Deposits
  createDeposit: (d: any) => request('/deposits', { method: 'POST', body: JSON.stringify(d) }),
  getDeposits: () => request('/deposits'),
  getAdminDeposits: (status?: string) => request(`/admin/deposits${status ? `?status=${status}` : ''}`),
  approveDeposit: (id: string) => request(`/admin/deposits/${id}/approve`, { method: 'POST' }),
  rejectDeposit: (id: string, reason?: string) => request(`/admin/deposits/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Orders
  createOrder: (d: { serviceId: string; link: string; quantity: number }) => request('/orders', { method: 'POST', body: JSON.stringify(d) }),
  getOrders: () => request('/orders'),
  getAdminOrders: (status?: string) => request(`/admin/orders${status ? `?status=${status}` : ''}`),
  startOrder: (id: string) => request(`/admin/orders/${id}/start`, { method: 'POST' }),
  completeOrder: (id: string) => request(`/admin/orders/${id}/complete`, { method: 'POST' }),
  cancelOrder: (id: string, refund?: boolean) => request(`/admin/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ refund }) }),

  // Wallet
  getWalletTransactions: () => request('/wallet-transactions'),
  getAdminWalletTransactions: () => request('/admin/wallet-transactions'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request('/notifications/read-all', { method: 'POST' }),

  // Support
  createTicket: (d: { subject: string; message: string }) => request('/support-tickets', { method: 'POST', body: JSON.stringify(d) }),
  getTickets: () => request('/support-tickets'),
  getAdminTickets: () => request('/admin/support-tickets'),
  replyTicket: (id: string, d: { reply: string; status?: string }) => request(`/admin/support-tickets/${id}/reply`, { method: 'POST', body: JSON.stringify(d) }),

  // Plans
  getPlans: () => request('/plans'),
  getAdminPlans: () => request('/admin/plans'),
  createPlan: (d: any) => request('/admin/plans', { method: 'POST', body: JSON.stringify(d) }),
  updatePlan: (id: string, d: any) => request(`/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deletePlan: (id: string) => request(`/admin/plans/${id}`, { method: 'DELETE' }),

  // User Plans
  getUserPlans: () => request('/user-plans'),
  purchasePlan: (planId: string) => request('/user-plans', { method: 'POST', body: JSON.stringify({ planId }) }),

  // Admin Users
  getAdminUsers: () => request('/admin/users'),
  getAdminUser: (id: string) => request(`/admin/users/${id}`),
  updateAdminUser: (id: string, d: any) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  adjustBalance: (id: string, d: { amount: number; type: string; description?: string }) => request(`/admin/users/${id}/adjust-balance`, { method: 'POST', body: JSON.stringify(d) }),

  // Backup
  exportBackup: () => request('/admin/backup/export'),
  importBackup: (data: any) => request('/admin/backup/import', { method: 'POST', body: JSON.stringify(data) }),
}

export function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString()}`
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function parseSenderInfo(info: string | null): { name?: string; account?: string; bank?: string; raw?: string } {
  if (!info) return { raw: 'Not provided' }
  try {
    const parsed = JSON.parse(info)
    if (parsed.name || parsed.account || parsed.bank) return parsed
    return { raw: info }
  } catch {
    return { raw: info }
  }
}
