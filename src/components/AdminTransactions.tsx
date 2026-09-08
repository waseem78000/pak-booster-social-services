import { useState, useEffect } from 'react'
import { api, formatCurrency, formatDate, parseSenderInfo } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Wallet, Search, ArrowUpRight, ArrowDownLeft, CreditCard, Hash, User, Calendar, Clock, CheckCircle, XCircle, Smartphone, Copy, Check, Eye, EyeOff } from 'lucide-react'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showScreenshots, setShowScreenshots] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    api.getAdminWalletTransactions().then(d => setTransactions(d.transactions || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = transactions.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return t.user?.username?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.deposit?.transactionId?.toLowerCase().includes(q) || t.deposit?.senderInfo?.toLowerCase().includes(q)
  })

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(id)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {}
  }

  const statusColor = (s: string) => {
    const m: Record<string, string> = { completed: 'bg-green-500/20 text-green-300 border-green-500/30', pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', failed: 'bg-red-500/20 text-red-300 border-red-500/30' }
    return m[s] || 'bg-slate-500/20 text-slate-300'
  }

  const typeIcon = (type: string) => {
    if (type === 'credit') return <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><ArrowDownLeft className="w-4 h-4 text-green-400" /></div>
    return <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><ArrowUpRight className="w-4 h-4 text-red-400" /></div>
  }

  const methodIcon = (method: string) => {
    const m: Record<string, string> = { jazzcash: '📱', easypaisa: '💚', qr_code: '🔲' }
    return m[method?.toLowerCase()] || '💳'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Transactions</h1>
        <p className="text-slate-400">{transactions.length} total transactions — full deposit & order details</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search by user, TX ID, description, or sender..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500" />
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-slate-900 rounded-xl h-40 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 text-center">
            <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No transactions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(t => (
            <Card key={t.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all overflow-hidden">
              <CardContent className="p-0">
                {/* Header — type, user, amount, date */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 pb-3 border-b border-slate-800/50">
                  <div className="flex items-center gap-3">
                    {typeIcon(t.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{t.user?.username || 'Unknown'}</span>
                        <Badge className={`text-xs border ${statusColor(t.status)}`}>{t.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(t.createdAt)}
                        </span>
                        <span className={`text-xs font-bold ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                          {t.type === 'credit' ? '+' : '-'} {formatCurrency(t.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-xs">Balance After</p>
                    <p className="text-white font-semibold">{formatCurrency(t.newBalance)}</p>
                  </div>
                </div>

                {/* Body — full deposit/order details */}
                <div className="p-4">
                  <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">Transaction Details</p>

                  {/* Description */}
                  <div className="mb-3 bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                    <p className="text-slate-300 text-sm">{t.description}</p>
                  </div>

                  {/* Deposit Details — same as deposit request page */}
                  {t.deposit && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-xs font-medium uppercase tracking-wider">Deposit Information</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Method */}
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                            <Smartphone className="w-3 h-3" /> Method
                          </div>
                          <p className="text-white text-sm font-medium flex items-center gap-1.5">
                            {methodIcon(t.deposit.method)} <span className="capitalize">{t.deposit.method?.replace('_', ' ')}</span>
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                            <Wallet className="w-3 h-3" /> Amount
                          </div>
                          <p className="text-emerald-400 text-lg font-bold">{formatCurrency(t.deposit.amount)}</p>
                        </div>

                        {/* TX ID */}
                        {t.deposit.transactionId && (
                          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                              <Hash className="w-3 h-3" /> TX ID
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-white text-sm font-mono">{t.deposit.transactionId}</p>
                              <button onClick={() => copyText(t.deposit.transactionId, `tx-${t.id}`)}
                                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                                {copiedField === `tx-${t.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Deposit Status */}
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                            <CheckCircle className="w-3 h-3" /> Status
                          </div>
                          <Badge className={`text-xs border ${statusColor(t.deposit.status)}`}>{t.deposit.status}</Badge>
                        </div>
                      </div>

                      {/* Sender Info */}
                      {t.deposit.senderInfo && (
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                          {(() => {
                            const sender = parseSenderInfo(t.deposit.senderInfo)
                            return (
                              <div className="space-y-2">
                                <span className="text-slate-500 text-xs flex items-center gap-1.5">
                                  <User className="w-3 h-3" /> Sender Details
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <p className="text-slate-400 text-xs">Name</p>
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-white">{sender.name || sender.raw}</p>
                                      {sender.name && <button onClick={() => copyText(sender.name!, `sname-${t.id}`)}
                                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                                        {copiedField === `sname-${t.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                      </button>}
                                    </div>
                                  </div>
                                  {sender.account && <div>
                                    <p className="text-slate-400 text-xs">Account Number</p>
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-white font-mono">{sender.account}</p>
                                      <button onClick={() => copyText(sender.account!, `sacc-${t.id}`)}
                                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                                        {copiedField === `sacc-${t.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>}
                                  {sender.bank && <div>
                                    <p className="text-slate-400 text-xs">Bank / Wallet</p>
                                    <p className="text-white">{sender.bank}</p>
                                  </div>}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      )}

                      {/* Screenshot */}
                      {t.deposit.screenshot && (
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 text-xs flex items-center gap-1.5">
                              📷 Payment Screenshot
                            </span>
                            <button onClick={() => setShowScreenshots(showScreenshots === t.id ? null : t.id)}
                              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
                              {showScreenshots === t.id ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> View</>}
                            </button>
                          </div>
                          {showScreenshots === t.id && (
                            <div className="mt-2">
                              <img src={t.deposit.screenshot} alt="Payment Screenshot" className="max-w-sm rounded-lg border border-slate-700" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reviewed At */}
                      {t.deposit.reviewedAt && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Clock className="w-3 h-3" /> Reviewed: {formatDate(t.deposit.reviewedAt)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Details — if it's an order transaction */}
                  {t.order && !t.deposit && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-xs font-medium uppercase tracking-wider">Order Information</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                          <span className="text-slate-500 text-xs">Order ID</span>
                          <p className="text-white text-sm font-mono">#{t.order.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                          <span className="text-slate-500 text-xs">Status</span>
                          <Badge className={`text-xs border ${statusColor(t.order.status)}`}>{t.order.status}</Badge>
                        </div>
                      </div>
                      {t.order.link && (
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                          <span className="text-slate-500 text-xs">Link</span>
                          <p className="text-white text-xs font-mono break-all">{t.order.link}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
