import { useState, useEffect } from 'react'
import { api, formatCurrency, formatDate } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ListOrdered, Play, CheckCircle, XCircle, Search } from 'lucide-react'

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { loadOrders() }, [filter])

  const loadOrders = async () => {
    try {
      const data = await api.getAdminOrders(filter === 'all' ? undefined : filter)
      setOrders(data.orders || [])
    } catch {} finally { setLoading(false) }
  }

  const statusColor = (s: string) => {
    const m: Record<string, string> = { pending: 'bg-yellow-500/20 text-yellow-300', processing: 'bg-blue-500/20 text-blue-300', completed: 'bg-green-500/20 text-green-300', cancelled: 'bg-red-500/20 text-red-300', failed: 'bg-red-500/20 text-red-300' }
    return m[s] || 'bg-slate-500/20 text-slate-300'
  }

  const handleStart = async (id: string) => { await api.startOrder(id); loadOrders() }
  const handleComplete = async (id: string) => { await api.completeOrder(id); loadOrders() }
  const handleCancel = async (id: string) => {
    if (confirm('Cancel this order?')) { await api.cancelOrder(id, false); loadOrders() }
  }
  const handleRefund = async (id: string) => {
    if (confirm('Cancel and refund this order?')) { await api.cancelOrder(id, true); loadOrders() }
  }

  const filtered = orders.filter(o => {
    if (search) {
      const q = search.toLowerCase()
      return o.id.toLowerCase().includes(q) || o.user?.username?.toLowerCase().includes(q) || o.link?.toLowerCase().includes(q)
    }
    return true
  })

  const statuses = ['all', 'pending', 'processing', 'completed', 'cancelled', 'failed']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manage Orders</h1>
        <p className="text-slate-400">{orders.length} total orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === s ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-slate-900 rounded-xl h-20 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 text-center">
            <ListOrdered className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="text-left py-3 px-3">ID</th>
                <th className="text-left py-3 px-3">User</th>
                <th className="text-left py-3 px-3">Service</th>
                <th className="text-left py-3 px-3">Link</th>
                <th className="text-right py-3 px-3">Qty</th>
                <th className="text-right py-3 px-3">Amount</th>
                <th className="text-center py-3 px-3">Status</th>
                <th className="text-right py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-3 px-3 text-white font-mono text-xs">#{o.id.slice(-6).toUpperCase()}</td>
                  <td className="py-3 px-3 text-slate-300">{o.user?.username}</td>
                  <td className="py-3 px-3 text-white">{o.service?.name}</td>
                  <td className="py-3 px-3 text-slate-300 truncate max-w-[150px] text-xs">{o.link}</td>
                  <td className="py-3 px-3 text-right text-white">{o.quantity.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-white font-semibold">{formatCurrency(o.amount)}</td>
                  <td className="py-3 px-3 text-center"><Badge className={`text-xs ${statusColor(o.status)}`}>{o.status}</Badge></td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {o.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleStart(o.id)} className="bg-blue-500 hover:bg-blue-600 text-white h-7 text-xs">
                            <Play className="w-3 h-3 mr-1" /> Start
                          </Button>
                          <Button size="sm" onClick={() => handleCancel(o.id)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 h-7 text-xs">
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      {o.status === 'processing' && (
                        <>
                          <Button size="sm" onClick={() => handleComplete(o.id)} className="bg-green-500 hover:bg-green-600 text-white h-7 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" /> Complete
                          </Button>
                          <Button size="sm" onClick={() => handleRefund(o.id)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 h-7 text-xs">
                            Cancel & Refund
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
