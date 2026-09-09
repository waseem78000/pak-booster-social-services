import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import Auth from '@/components/Auth'
import Layout from '@/components/Layout'
import UserDashboard from '@/components/UserDashboard'
import Services from '@/components/Services'
import NewOrder from '@/components/NewOrder'
import Orders from '@/components/Orders'
import AddFunds from '@/components/AddFunds'
import Transactions from '@/components/Transactions'
import Profile from '@/components/Profile'
import Notifications from '@/components/Notifications'
import Support from '@/components/Support'
import MyPlans from '@/components/MyPlans'
import AdminDashboard from '@/components/AdminDashboard'
import AdminServices from '@/components/AdminServices'
import AdminOrders from '@/components/AdminOrders'
import AdminDeposits from '@/components/AdminDeposits'
import AdminUsers from '@/components/AdminUsers'
import AdminPaymentSettings from '@/components/AdminPaymentSettings'
import AdminPlans from '@/components/AdminPlans'
import AdminTransactions from '@/components/AdminTransactions'
import AdminTickets from '@/components/AdminTickets'
import AdminNotifications from '@/components/AdminNotifications'
import AdminBackup from '@/components/AdminBackup'
import HomePage from '@/components/HomePage'
import { theme } from '@/lib/theme'

export default function App() {
  const [view, setView] = useState<'home' | 'auth'>('home')
  const [authMode, setAuthMode] = useState<'user' | 'admin'>('user')
  const [page, setPage] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('pb_theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    localStorage.setItem('pb_theme', isDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  useEffect(() => {
    const token = localStorage.getItem('smm_token')
    const adminToken = localStorage.getItem('smm_admin_token')
    if (adminToken) {
      api.adminMe().then(d => { setAdmin(d.admin); setPage('admin-dashboard') }).catch(() => {
        localStorage.removeItem('smm_admin_token')
      }).finally(() => setLoading(false))
    } else if (token) {
      api.getMe().then(d => setUser(d.user)).catch(() => {
        localStorage.removeItem('smm_token')
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleUserAuth = (token: string, userData: any) => {
    setUser(userData)
    setPage('dashboard')
  }

  const handleAdminAuth = (token: string, adminData: any) => {
    setAdmin(adminData)
    setPage('admin-dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('smm_token')
    localStorage.removeItem('smm_admin_token')
    setUser(null)
    setAdmin(null)
    setPage('dashboard')
    setAuthMode('user')
    setView('home')
  }

  const goToAuth = (mode: 'user' | 'admin') => {
    setAuthMode(mode)
    setView('auth')
  }

  const t = isDark ? theme.dark : theme.light

  if (loading) {
    return (
      <div className={`min-h-screen ${t.bg} flex items-center justify-center transition-colors duration-500`}>
        <div className="text-center">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${t.gradient} flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xl shadow-emerald-500/25`}>
            <svg width="28" height="28" viewBox="0 0 52 52" fill="none">
              <circle cx="28" cy="26" r="12" fill="white" />
              <circle cx="32" cy="23" r="10" fill="url(#pkgGrad)" />
              <path d="M36 26l-2.12 6.53h-6.88l5.57-4.03-2.12-6.53 5.55 4.03z" fill="white" />
            </svg>
          </div>
          <p className={`${t.textSub} font-medium`}>Loading PAK BOOSTER...</p>
        </div>
      </div>
    )
  }

  if (admin) {
    return (
      <Layout currentPage={page} onNavigate={setPage} onLogout={handleLogout} user={admin} isAdmin isDark={isDark} toggleTheme={toggleTheme}>
        {page === 'admin-dashboard' && <AdminDashboard />}
        {page === 'admin-users' && <AdminUsers />}
        {page === 'admin-deposits' && <AdminDeposits />}
        {page === 'admin-services' && <AdminServices />}
        {page === 'admin-orders' && <AdminOrders />}
        {page === 'admin-plans' && <AdminPlans />}
        {page === 'admin-payment' && <AdminPaymentSettings />}
        {page === 'admin-transactions' && <AdminTransactions />}
        {page === 'admin-tickets' && <AdminTickets />}
        {page === 'admin-notifications' && <AdminNotifications />}
        {page === 'admin-backup' && <AdminBackup isDark={isDark} />}
      </Layout>
    )
  }

  if (user) {
    return (
      <Layout currentPage={page} onNavigate={setPage} onLogout={handleLogout} user={user} isDark={isDark} toggleTheme={toggleTheme}>
        {page === 'dashboard' && <UserDashboard user={user} onNavigate={setPage} />}
        {page === 'services' && <Services onNavigate={setPage} />}
        {page === 'new-order' && <NewOrder user={user} onNavigate={setPage} />}
        {page === 'orders' && <Orders />}
        {page === 'add-funds' && <AddFunds user={user} />}
        {page === 'transactions' && <Transactions />}
        {page === 'my-plans' && <MyPlans />}
        {page === 'notifications' && <Notifications />}
        {page === 'support' && <Support />}
        {page === 'profile' && <Profile user={user} />}
      </Layout>
    )
  }

  if (view === 'home' && !user && !admin) {
    return <HomePage onLogin={() => goToAuth('user')} onRegister={() => goToAuth('user')} isDark={isDark} toggleTheme={toggleTheme} />
  }

  return (
    <Auth
      mode={authMode}
      onAuth={authMode === 'admin' ? handleAdminAuth : handleUserAuth}
      onSwitchMode={() => setAuthMode(authMode === 'admin' ? 'user' : 'admin')}
      onBack={() => setView('home')}
    />
  )
}
