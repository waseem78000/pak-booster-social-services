import { useState, useEffect } from 'react'
import { api, formatCurrency, formatDate } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ListOrdered, Search, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    try {
      const data = await api.getOrders()
      setOrders(data.orders || [])
    } catch {} finally { setLoading(false) }
  }

  const statusColor = (s: string) => {
    const m: Record<string, string> = { pending: 'bg-yellow-500/20 text-yellow-300', processing: 'bg-blue-500/20 text-blue-300', completed: 'bg-green-500/20 text-green-300', cancelled: 'bg-red-500/20 text-red-300', failed: 'bg-red-500/20 text-red-300' }
    return m[s] || 'bg-slate-500/20 text-slate-300'
  }

  const statusIcon = (s: string) => {
    if (s === 'completed') return <CheckCircle className="w-4 h-4 text-green-400" />
    if (s === 'processing') return <Clock className="w-4 h-4 text-blue-400" />
    if (s === 'cancelled' || s === 'failed') return <XCircle className="w-4 h-4 text-red-400" />
    return <AlertCircle className="w-4 h-4 text-yellow-400" />
  }

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return o.id.toLowerCase().includes(q) || o.service?.name?.toLowerCase().includes(q) || o.link?.toLowerCase().includes(q)
    }
    return true
  })

  const statuses = ['all', 'pending', 'processing', 'completed', 'cancelled', 'failed']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Orders</h1>
        <p className="text-slate-400">Track all your orders</p>
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
        <div className="space-y-3">
          {filtered.map(o => (
            <Card key={o.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcon(o.status)}
                    <div>
                      <p className="text-white font-medium">{o.service?.name || 'Service'}</p>
                      <p className="text-slate-400 text-xs">#{o.id.slice(-6).toUpperCase()} • {o.service?.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatCurrency(o.amount)}</p>
                    <Badge className={`text-xs ${statusColor(o.status)}`}>{o.status}</Badge>
                  </div>
                </div>
                {selectedOrder?.id === o.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-slate-400">Link</p><p className="text-white truncate max-w-[200px]">{o.link}</p></div>
                    <div><p className="text-slate-400">Quantity</p><p className="text-white">{o.quantity.toLocaleString()}</p></div>
                    <div><p className="text-slate-400">Date</p><p className="text-white text-xs">{formatDate(o.createdAt)}</p></div>
                    <div><p className="text-slate-400">Status</p><p className="text-white capitalize">{o.status}</p></div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
