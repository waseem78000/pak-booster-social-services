import { useState, useEffect } from 'react'
import { api, formatCurrency, formatDate } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreditCard, CheckCircle, XCircle, Eye, Search } from 'lucide-react'

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewDeposit, setViewDeposit] = useState<any>(null)

  useEffect(() => { loadDeposits() }, [filter])

  const loadDeposits = async () => {
    try {
      const data = await api.getAdminDeposits(filter === 'all' ? undefined : filter)
      setDeposits(data.deposits || [])
    } catch {} finally { setLoading(false) }
  }

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this deposit?')) return
    try { await api.approveDeposit(id); loadDeposits() } catch (e: any) { alert(e.message) }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason (optional):')
    try { await api.rejectDeposit(id, reason || undefined); loadDeposits() } catch (e: any) { alert(e.message) }
  }

  const statusColor = (s: string) => {
    const m: Record<string, string> = { pending: 'bg-yellow-500/20 text-yellow-300', approved: 'bg-green-500/20 text-green-300', rejected: 'bg-red-500/20 text-red-300' }
    return m[s] || 'bg-slate-500/20 text-slate-300'
  }

  const filtered = deposits.filter(d => {
    if (search) {
      const q = search.toLowerCase()
      return d.id.toLowerCase().includes(q) || d.user?.username?.toLowerCase().includes(q) || d.transactionId?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Deposit Requests</h1>
        <p className="text-slate-400">{deposits.length} total requests</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500" />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
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
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No deposit requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="text-left py-3 px-3">ID</th>
                <th className="text-left py-3 px-3">User</th>
                <th className="text-right py-3 px-3">Amount</th>
                <th className="text-left py-3 px-3">Method</th>
                <th className="text-left py-3 px-3">TX ID</th>
                <th className="text-center py-3 px-3">Status</th>
                <th className="text-left py-3 px-3">Date</th>
                <th className="text-right py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-3 px-3 text-white font-mono text-xs">#{d.id.slice(-6).toUpperCase()}</td>
                  <td className="py-3 px-3 text-slate-300">{d.user?.username}</td>
                  <td className="py-3 px-3 text-right text-white font-semibold">{formatCurrency(d.amount)}</td>
                  <td className="py-3 px-3 text-slate-300 capitalize">{d.method}</td>
                  <td className="py-3 px-3 text-slate-300 font-mono text-xs">{d.transactionId || '-'}</td>
                  <td className="py-3 px-3 text-center"><Badge className={`text-xs ${statusColor(d.status)}`}>{d.status}</Badge></td>
                  <td className="py-3 px-3 text-slate-400 text-xs">{formatDate(d.createdAt)}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {d.screenshot && (
                        <Button size="sm" onClick={() => setViewDeposit(d)} className="bg-slate-700 hover:bg-slate-600 text-white h-7 text-xs">
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                      {d.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(d.id)} className="bg-green-500 hover:bg-green-600 text-white h-7 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" onClick={() => handleReject(d.id)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 h-7 text-xs">
                            <XCircle className="w-3 h-3" />
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

      <Dialog open={!!viewDeposit} onOpenChange={() => setViewDeposit(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {viewDeposit?.screenshot && (
            <div className="space-y-4">
              <img src={viewDeposit.screenshot} alt="Screenshot" className="w-full rounded-lg border border-slate-700" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-400">Amount</p><p className="text-white font-semibold">{formatCurrency(viewDeposit.amount)}</p></div>
                <div><p className="text-slate-400">Method</p><p className="text-white capitalize">{viewDeposit.method}</p></div>
                <div><p className="text-slate-400">TX ID</p><p className="text-white font-mono text-xs">{viewDeposit.transactionId}</p></div>
                <div><p className="text-slate-400">User</p><p className="text-white">{viewDeposit.user?.username}</p></div>
              </div>
              {viewDeposit.status === 'pending' && (
                <div className="flex gap-2">
                  <Button onClick={() => { handleApprove(viewDeposit.id); setViewDeposit(null) }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white">Approve</Button>
                  <Button onClick={() => { handleReject(viewDeposit.id); setViewDeposit(null) }}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300">Reject</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
