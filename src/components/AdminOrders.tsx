import { useState, useEffect } from 'react'
import { api, formatCurrency, formatDate } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ListOrdered, Play, CheckCircle, XCircle, Search, ExternalLink, Copy, Check, Calendar, User, Link2, Hash, Package, DollarSign, Clock } from 'lucide-react'

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => { loadOrders() }, [filter])

  const loadOrders = async () => {
    try {
      const data = await api.getAdminOrders(filter === 'all' ? undefined : filter)
      setOrders(data.orders || [])
    } catch {} finally { setLoading(false) }
  }

  const statusColor = (s: string) => {
    const m: Record<string, string> = { pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', processing: 'bg-blue-500/20 text-blue-300 border-blue-500/30', completed: 'bg-green-500/20 text-green-300 border-green-500/30', cancelled: 'bg-red-500/20 text-red-300 border-red-500/30', failed: 'bg-red-500/20 text-red-300 border-red-500/30' }
    return m[s] || 'bg-slate-500/20 text-slate-300'
  }

  const statusDot = (s: string) => {
    const m: Record<string, string> = { pending: 'bg-yellow-400', processing: 'bg-blue-400', completed: 'bg-green-400', cancelled: 'bg-red-400', failed: 'bg-red-400' }
    return m[s] || 'bg-slate-400'
  }

  const copyLink = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
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
      return o.id.toLowerCase().includes(q) || o.user?.username?.toLowerCase().includes(q) || o.link?.toLowerCase().includes(q) || o.service?.name?.toLowerCase().includes(q)
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
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-slate-900 rounded-xl h-48 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 text-center">
            <ListOrdered className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(o => (
            <Card key={o.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all overflow-hidden">
              <CardContent className="p-0">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 pb-3 border-b border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusDot(o.status)}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-sm font-bold">#{o.id.slice(-6).toUpperCase()}</span>
                        <Badge className={`text-xs border ${statusColor(o.status)}`}>{o.status}</Badge>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">{formatDate(o.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => handleStart(o.id)} className="bg-blue-500 hover:bg-blue-600 text-white h-8 text-xs">
                          <Play className="w-3 h-3 mr-1" /> Start
                        </Button>
                        <Button size="sm" onClick={() => handleCancel(o.id)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 h-8 text-xs">
                          <XCircle className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      </>
                    )}
                    {o.status === 'processing' && (
                      <>
                        <Button size="sm" onClick={() => handleComplete(o.id)} className="bg-green-500 hover:bg-green-600 text-white h-8 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" /> Complete
                        </Button>
                        <Button size="sm" onClick={() => handleRefund(o.id)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 h-8 text-xs">
                          Cancel & Refund
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Invoice Body */}
                <div className="p-4">
                  {/* Link Bar — Full link with copy */}
                  <div className="flex items-center gap-2 mb-4 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <Link2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-slate-300 text-xs font-mono truncate flex-1 break-all">{o.link}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <a href={o.link} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Open link">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => copyLink(o.link, o.id)}
                        className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Copy link">
                        {copiedId === o.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Invoice Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                        <User className="w-3 h-3" /> Customer
                      </div>
                      <p className="text-white text-sm font-medium">{o.user?.username || 'Unknown'}</p>
                      <p className="text-slate-500 text-xs">{o.user?.email}</p>
                    </div>

                    <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                        <Package className="w-3 h-3" /> Service
                      </div>
                      <p className="text-white text-sm font-medium">{o.service?.name || 'Unknown'}</p>
                      {o.service?.category && <p className="text-slate-500 text-xs">{o.service.category}</p>}
                    </div>

                    <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                        <Hash className="w-3 h-3" /> Quantity
                      </div>
                      <p className="text-white text-lg font-bold">{o.quantity?.toLocaleString()}</p>
                    </div>

                    <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                        <DollarSign className="w-3 h-3" /> Amount
                      </div>
                      <p className="text-emerald-400 text-lg font-bold">{formatCurrency(o.amount)}</p>
                    </div>
                  </div>

                  {/* Invoice Footer — timestamps */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Calendar className="w-3 h-3" /> Created: {formatDate(o.createdAt)}
                    </div>
                    {o.completedAt && (
                      <div className="flex items-center gap-1.5 text-green-400 text-xs">
                        <CheckCircle className="w-3 h-3" /> Completed: {formatDate(o.completedAt)}
                      </div>
                    )}
                    {o.status === 'processing' && (
                      <div className="flex items-center gap-1.5 text-blue-400 text-xs">
                        <Clock className="w-3 h-3" /> Processing...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
