import { useState, useEffect } from 'react'
import { api, formatDate } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Reply } from 'lucide-react'

export default function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [reply, setReply] = useState('')

  useEffect(() => { loadTickets() }, [])

  const loadTickets = async () => {
    try { const data = await api.getAdminTickets(); setTickets(data.tickets || []) } catch {} finally { setLoading(false) }
  }

  const handleReply = async (id: string) => {
    if (!reply.trim()) return
    await api.replyTicket(id, { reply, status: 'replied' })
    setReply('')
    setSelected(null)
    loadTickets()
  }

  const statusColor = (s: string) => {
    const m: Record<string, string> = { open: 'bg-yellow-500/20 text-yellow-300', replied: 'bg-green-500/20 text-green-300', closed: 'bg-slate-500/20 text-slate-300' }
    return m[s] || 'bg-slate-500/20 text-slate-300'
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
        <p className="text-slate-400">{tickets.length} total tickets</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="bg-slate-900 rounded-xl h-24 animate-pulse" />)}</div>
      ) : tickets.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No support tickets</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <Card key={t.id} className="bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-700 transition-all"
              onClick={() => setSelected(selected?.id === t.id ? null : t)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="text-white font-medium">{t.subject}</h3>
                      <p className="text-slate-400 text-xs">{t.user?.username} • {formatDate(t.createdAt)}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${statusColor(t.status)}`}>{t.status}</Badge>
                </div>
                {selected?.id === t.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                    <p className="text-slate-300 text-sm">{t.message}</p>
                    {t.reply && (
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-green-400 text-xs font-medium mb-1">Your Reply:</p>
                        <p className="text-slate-300 text-sm">{t.reply}</p>
                      </div>
                    )}
                    {t.status !== 'closed' && (
                      <div className="flex gap-2">
                        <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..."
                          onClick={e => e.stopPropagation()}
                          className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleReply(t.id) }}
                          className="bg-purple-500 hover:bg-purple-600 text-white">
                          <Reply className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
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
