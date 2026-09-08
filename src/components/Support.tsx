import { useState, useEffect } from 'react'
import { api, formatDate } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Headphones, Plus, MessageSquare } from 'lucide-react'

export default function Support() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { loadTickets() }, [])

  const loadTickets = async () => {
    try {
      const data = await api.getTickets()
      setTickets(data.tickets || [])
    } catch {} finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject || !form.message) return
    setSubmitting(true)
    try {
      await api.createTicket(form)
      setForm({ subject: '', message: '' })
      setShowForm(false)
      loadTickets()
    } catch {} finally { setSubmitting(false) }
  }

  const statusColor = (s: string) => {
    const m: Record<string, string> = { open: 'bg-yellow-500/20 text-yellow-300', replied: 'bg-green-500/20 text-green-300', closed: 'bg-slate-500/20 text-slate-300' }
    return m[s] || 'bg-slate-500/20 text-slate-300'
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-slate-400">Get help with your account</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Ticket
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white text-lg">New Support Ticket</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-slate-300">Subject</Label>
                <Input placeholder="Brief description" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="mt-1 bg-slate-800 border-slate-700 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Message</Label>
                <textarea placeholder="Describe your issue..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="mt-1 w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <Button type="submit" disabled={submitting}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                {submitting ? 'Sending...' : 'Submit Ticket'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="bg-slate-900 rounded-xl h-24 animate-pulse" />)}</div>
      ) : tickets.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 text-center">
            <Headphones className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No support tickets yet</p>
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
                      <p className="text-slate-400 text-xs">{formatDate(t.createdAt)}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${statusColor(t.status)}`}>{t.status}</Badge>
                </div>
                {selected?.id === t.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                    <p className="text-slate-300 text-sm">{t.message}</p>
                    {t.reply && (
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-purple-400 text-xs font-medium mb-1">Admin Reply:</p>
                        <p className="text-slate-300 text-sm">{t.reply}</p>
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
