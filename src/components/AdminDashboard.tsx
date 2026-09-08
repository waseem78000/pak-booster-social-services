import { useState, useEffect } from 'react'
import { api, formatCurrency } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Users, CreditCard, ListOrdered, DollarSign, Clock, CheckCircle, TrendingUp, Wallet } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.adminDashboard().then(d => setStats(d)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Deposits', value: formatCurrency(stats.totalDeposits), icon: CreditCard, color: 'from-green-500 to-emerald-500' },
    { label: 'Pending Deposits', value: formatCurrency(stats.pendingDeposits), icon: Clock, color: 'from-yellow-500 to-orange-500' },
    { label: 'Approved Deposits', value: formatCurrency(stats.approvedDeposits), icon: CheckCircle, color: 'from-green-500 to-teal-500' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ListOrdered, color: 'from-purple-500 to-pink-500' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'from-yellow-500 to-amber-500' },
    { label: 'Processing', value: stats.processingOrders, icon: TrendingUp, color: 'from-blue-500 to-indigo-500' },
    { label: 'Completed', value: stats.completedOrders, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'from-red-500 to-pink-500' },
    { label: 'Wallet Activity', value: formatCurrency(stats.walletActivity), icon: Wallet, color: 'from-violet-500 to-purple-500' },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400">Overview of your SMM panel</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="bg-slate-900 rounded-xl h-28 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((c, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${c.color} flex items-center justify-center mb-3`}>
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-slate-400 text-xs">{c.label}</p>
                <p className="text-white font-bold text-lg">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
