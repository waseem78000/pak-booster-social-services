import { useState, useEffect } from 'react'
import { api, formatCurrency, formatDate } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Wallet, Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getAdminWalletTransactions().then(d => setTransactions(d.transactions || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = transactions.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return t.user?.username?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Transactions</h1>
        <p className="text-slate-400">Complete wallet transaction history</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search by user or description..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-slate-900 rounded-xl h-16 animate-pulse" />)}</div>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-right py-3 px-4">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-slate-400 text-xs">{formatDate(t.createdAt)}</td>
                      <td className="py-3 px-4 text-white text-xs">{t.user?.username}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {t.type === 'credit' ? <ArrowDownLeft className="w-3 h-3 text-green-400" /> : <ArrowUpRight className="w-3 h-3 text-red-400" />}
                          <span className={`text-xs capitalize font-medium ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>{t.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs max-w-[250px] truncate">{t.description}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-semibold ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                          {t.type === 'credit' ? '+' : '-'} {formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 text-xs">{formatCurrency(t.newBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
