import { useState, useEffect } from 'react'
import { api, formatCurrency } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard, ShoppingCart, Plus, CreditCard, ListOrdered, Wallet,
  Bell, UserCircle, LogOut, Settings, Users, FileText, MessageSquare,
  Menu, X, ChevronDown, Zap, BarChart3, Headphones, Tag, Sun, Moon, Shield
} from 'lucide-react'
import Logo from '@/components/Logo'
import { theme } from '@/lib/theme'

interface LayoutProps {
  children: React.ReactNode
  currentPage: string
  onNavigate: (page: string) => void
  onLogout: () => void
  user: any
  isAdmin?: boolean
  isDark: boolean
  toggleTheme: () => void
}

export default function Layout({ children, currentPage, onNavigate, onLogout, user, isAdmin, isDark, toggleTheme }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const t = isDark ? theme.dark : theme.light

  useEffect(() => {
    if (!isAdmin) {
      loadNotifications()
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [isAdmin])

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications()
      setNotifications(data.notifications || [])
      setUnreadCount((data.notifications || []).filter((n: any) => !n.readStatus).length)
    } catch {}
  }

  type MenuItem = { id: string; label: string; icon: any; badge?: number }

  const userMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Zap },
    { id: 'new-order', label: 'New Order', icon: Plus },
    { id: 'orders', label: 'My Orders', icon: ListOrdered },
    { id: 'add-funds', label: 'Add Funds', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: Wallet },
    { id: 'my-plans', label: 'My Plans', icon: Tag },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ]

  const adminMenuItems: MenuItem[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'admin-users', label: 'Users', icon: Users },
    { id: 'admin-deposits', label: 'Deposits', icon: CreditCard },
    { id: 'admin-services', label: 'Services', icon: Zap },
    { id: 'admin-orders', label: 'Orders', icon: ListOrdered },
    { id: 'admin-plans', label: 'Plans', icon: Tag },
    { id: 'admin-payment', label: 'Payment Settings', icon: Settings },
    { id: 'admin-transactions', label: 'Transactions', icon: Wallet },
    { id: 'admin-tickets', label: 'Support Tickets', icon: MessageSquare },
    { id: 'admin-notifications', label: 'Notifications', icon: Bell },
    { id: 'admin-backup', label: 'Backup & Restore', icon: Shield },
  ]

  const menuItems: MenuItem[] = isAdmin ? adminMenuItems : userMenuItems

  return (
    <div className={`min-h-screen ${t.bg} flex transition-colors duration-500`}>
      {sidebarOpen && (
        <div className={`fixed inset-0 ${t.overlay} z-40 lg:hidden`} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 ${t.bgSidebar} border-r ${t.border} transform transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className={`flex items-center justify-between p-4 border-b ${t.border}`}>
            <Logo isDark={isDark} size="sidebar" />
            <button onClick={() => setSidebarOpen(false)} className={`lg:hidden ${t.textMuted} hover:${t.text}`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? t.activeItem
                    : `${t.textNav} ${t.hoverItem} hover:${t.text}`
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <Badge className="bg-red-500 text-white text-xs px-1.5 min-w-[20px] justify-center">{item.badge}</Badge>
                ) : null}
              </button>
            ))}
          </nav>

          <div className={`p-3 border-t ${t.border}`}>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className={`sticky top-0 z-30 h-16 ${t.bgNav} backdrop-blur-2xl border-b ${t.border} flex items-center justify-between px-4 lg:px-6 transition-colors duration-500`}>
          <button onClick={() => setSidebarOpen(true)} className={`lg:hidden ${t.textMuted} hover:${t.text}`}>
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button onClick={toggleTheme} className={`p-2 rounded-xl ${isDark ? 'bg-[#162032] text-yellow-400 hover:bg-[#1c2b4a]' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'} transition-all duration-300`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {!isAdmin && (
              <div className={`hidden sm:flex items-center gap-2 ${isDark ? 'bg-[#111b2e]' : 'bg-emerald-50'} rounded-xl px-4 py-2 border ${t.border} transition-colors duration-500`}>
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-sm">{formatCurrency(user?.walletBalance || 0)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                {(user?.name || user?.username || 'U')[0].toUpperCase()}
              </div>
              <span className={`${t.text} text-sm font-semibold hidden sm:block transition-colors`}>{user?.name || user?.username}</span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
