import { useState, useEffect } from 'react'
import { api, formatCurrency, formatDate } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Search, Wallet, Plus, Minus, Eye } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [adjustUser, setAdjustUser] = useState<any>(null)
  const [adjustForm, setAdjustForm] = useState({ amount: '', type: 'credit', description: '' })

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    try { const data = await api.getAdminUsers(); setUsers(data.users || []) } catch {} finally { setLoading(false) }
  }

  const handleAdjust = async () => {
    if (!adjustUser || !adjustForm.amount) return
    try {
      await api.adjustBalance(adjustUser.id, { amount: parseFloat(adjustForm.amount), type: adjustForm.type, description: adjustForm.description })
      setAdjustUser(null)
      setAdjustForm({ amount: '', type: 'credit', description: '' })
      loadUsers()
    } catch (e: any) { alert(e.message) }
  }

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active'
    await api.updateAdminUser(user.id, { status: newStatus })
    loadUsers()
  }

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manage Users</h1>
        <p className="text-slate-400">{users.length} total users</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-slate-900 rounded-xl h-16 animate-pulse" />)}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="text-left py-3 px-3">User</th>
                <th className="text-left py-3 px-3">Email</th>
                <th className="text-right py-3 px-3">Balance</th>
                <th className="text-center py-3 px-3">Status</th>
                <th className="text-left py-3 px-3">Joined</th>
                <th className="text-right py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {(u.username || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{u.email}</td>
                  <td className="py-3 px-3 text-right text-white font-semibold">{formatCurrency(u.walletBalance)}</td>
                  <td className="py-3 px-3 text-center">
                    <button onClick={() => handleToggleStatus(u)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {u.status}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="py-3 px-3 text-right">
                    <Button size="sm" onClick={() => setAdjustUser(u)}
                      className="bg-slate-700 hover:bg-slate-600 text-white h-7 text-xs">
                      <Wallet className="w-3 h-3 mr-1" /> Wallet
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!adjustUser} onOpenChange={() => setAdjustUser(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Wallet - {adjustUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">Current Balance: <span className="text-white font-semibold">{formatCurrency(adjustUser?.walletBalance || 0)}</span></p>
            <div>
              <Label className="text-slate-300">Type</Label>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setAdjustForm({ ...adjustForm, type: 'credit' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${adjustForm.type === 'credit' ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Plus className="w-4 h-4" /> Credit
                </button>
                <button onClick={() => setAdjustForm({ ...adjustForm, type: 'debit' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${adjustForm.type === 'debit' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Minus className="w-4 h-4" /> Debit
                </button>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Amount (Rs.)</Label>
              <Input type="number" min="1" value={adjustForm.amount} onChange={e => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                className="mt-1 bg-slate-800 border-slate-700" />
            </div>
            <div>
              <Label className="text-slate-300">Description</Label>
              <Input value={adjustForm.description} onChange={e => setAdjustForm({ ...adjustForm, description: e.target.value })}
                placeholder="Reason for adjustment" className="mt-1 bg-slate-800 border-slate-700" />
            </div>
            <Button onClick={handleAdjust} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              Apply Adjustment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
