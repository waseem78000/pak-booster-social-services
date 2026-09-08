import { useState, useEffect } from 'react'
import { api, formatCurrency, formatDate } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, ShoppingCart, Clock, CheckCircle, XCircle, Plus, TrendingUp, AlertCircle } from 'lucide-react'

export default function UserDashboard({ user, onNavigate }: { user: any; onNavigate: (p: string) => void }) {
  const [stats, setStats] = useState({ orders: 0, pending: 0, processing: 0, completed: 0, failed: 0, totalSpent: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentTxns, setRecentTxns] = useState<any[]>([])
  const [userPlans, setUserPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [ordersData, txnData, plansData] = await Promise.all([
        api.getOrders(),
        api.getWalletTransactions(),
        api.getUserPlans().catch(() => ({ userPlans: [] }))
      ])
      const orders = ordersData.orders || []
      setRecentOrders(orders.slice(0, 5))
      setRecentTxns((txnData.transactions || []).slice(0, 5))
      setUserPlans((plansData.userPlans || []).filter((p: any) => p.status === 'active'))
      setStats({
        orders: orders.length,
        pending: orders.filter((o: any) => o.status === 'pending').length,
        processing: orders.filter((o: any) => o.status === 'processing').length,
        completed: orders.filter((o: any) => o.status === 'completed').length,
        failed: orders.filter((o: any) => o.status === 'failed' || o.status === 'cancelled').length,
        totalSpent: orders.reduce((sum: number, o: any) => sum + o.amount, 0),
      })
    } catch {} finally { setLoading(false) }
  }

  const statCards = [
    { label: 'Wallet Balance', value: formatCurrency(user?.walletBalance || 0), icon: Wallet, color: 'from-green-500 to-emerald-500', onClick: () => onNavigate('add-funds') },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'from-blue-500 to-cyan-500' },
    { label: 'Processing', value: stats.processing, icon: Clock, color: 'from-yellow-500 to-orange-500' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: TrendingUp, color: 'from-red-500 to-pink-500' },
  ]

  const statusColor = (s: string) => {
    const m: Record<string, string> = { pending: 'bg-yellow-500/20 text-yellow-300', processing: 'bg-blue-500/20 text-blue-300', completed: 'bg-green-500/20 text-green-300', cancelled: 'bg-red-500/20 text-red-300', failed: 'bg-red-500/20 text-red-300' }
    return m[s] || 'bg-slate-500/20 text-slate-300'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user?.name || user?.username}</p>
        </div>
        <button onClick={() => onNavigate('add-funds')} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all">
          <Plus className="w-4 h-4" /> Add Funds
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s, i) => (
          <Card key={i} onClick={s.onClick} className={`bg-slate-900 border-slate-800 ${s.onClick ? 'cursor-pointer hover:border-slate-700' : ''}`}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-slate-400 text-xs">{s.label}</p>
              <p className="text-white font-bold text-lg">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Plans */}
      {userPlans.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Active Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPlans.map((up: any) => (
              <Card key={up.id} className="bg-slate-900 border-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{up.plan?.name}</h3>
                    <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                  </div>
                  {up.plan?.views ? <p className="text-slate-300 text-sm">👁 Views: {up.plan.views.toLocaleString()}</p> : null}
                  {up.plan?.subscribers ? <p className="text-slate-300 text-sm">👤 Subscribers: {up.plan.subscribers.toLocaleString()}</p> : null}
                  <p className="text-slate-400 text-sm mt-2">Price: {formatCurrency(up.plan?.price || 0)}</p>
                  <p className="text-slate-400 text-sm">Expires: {formatDate(up.endDate)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white text-lg">Recent Orders</CardTitle>
            <button onClick={() => onNavigate('orders')} className="text-purple-400 hover:text-purple-300 text-sm">View All</button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">{o.service?.name || 'Service'}</p>
                      <p className="text-slate-400 text-xs">#{o.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{formatCurrency(o.amount)}</p>
                      <Badge className={`text-xs ${statusColor(o.status)}`}>{o.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white text-lg">Recent Transactions</CardTitle>
            <button onClick={() => onNavigate('transactions')} className="text-purple-400 hover:text-purple-300 text-sm">View All</button>
          </CardHeader>
          <CardContent>
            {recentTxns.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentTxns.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white text-sm">{t.description}</p>
                      <p className="text-slate-400 text-xs">{formatDate(t.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'credit' ? '+' : '-'} {formatCurrency(t.amount)}
                      </p>
                      <p className="text-slate-400 text-xs capitalize">{t.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
