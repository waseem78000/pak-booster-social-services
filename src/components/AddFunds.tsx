import { useState, useEffect } from 'react'
import { api, formatCurrency, formatDate } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Smartphone, QrCode, Upload, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function AddFunds({ user }: { user: any }) {
  const [settings, setSettings] = useState<any>(null)
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ amount: '', method: 'jazzcash', transactionId: '', senderInfo: '', screenshot: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [settingsData, depositsData] = await Promise.all([
        api.getPaymentSettings(),
        api.getDeposits()
      ])
      setSettings(settingsData.settings)
      setDeposits(depositsData.deposits || [])
    } catch {} finally { setLoading(false) }
  }

  const handleScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('File size must be less than 5MB'); return }
    const reader = new FileReader()
    reader.onload = () => setForm({ ...form, screenshot: reader.result as string })
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount'); return }
    if (!form.transactionId) { setError('Transaction ID is required'); return }
    setSubmitting(true)
    try {
      await api.createDeposit({
        amount: parseFloat(form.amount),
        method: form.method,
        transactionId: form.transactionId,
        senderInfo: form.senderInfo,
        screenshot: form.screenshot,
      })
      setSuccess('Payment request submitted successfully! It will be reviewed by admin shortly.')
      setForm({ amount: '', method: 'jazzcash', transactionId: '', senderInfo: '', screenshot: '' })
      loadData()
    } catch (e: any) { setError(typeof e.message === 'string' ? e.message : typeof e === 'string' ? e : 'Failed to submit payment') } finally { setSubmitting(false) }
  }

  const statusIcon = (s: string) => {
    if (s === 'approved') return <CheckCircle className="w-4 h-4 text-green-400" />
    if (s === 'rejected') return <XCircle className="w-4 h-4 text-red-400" />
    return <Clock className="w-4 h-4 text-yellow-400" />
  }

  const statusColor = (s: string) => {
    const m: Record<string, string> = { pending: 'bg-yellow-500/20 text-yellow-300', approved: 'bg-green-500/20 text-green-300', rejected: 'bg-red-500/20 text-red-300' }
    return m[s] || 'bg-slate-500/20 text-slate-300'
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-slate-900 rounded-xl h-40 animate-pulse" />)}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Add Funds</h1>
        <p className="text-slate-400">Deposit money to your wallet</p>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {settings?.jazzcashEnabled && (
          <Card className={`bg-slate-900 border-slate-800 cursor-pointer transition-all ${form.method === 'jazzcash' ? 'border-green-500 ring-2 ring-green-500/30' : 'hover:border-slate-700'}`}
            onClick={() => setForm({ ...form, method: 'jazzcash' })}>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold">JazzCash</h3>
              {settings.jazzcashTitle && <p className="text-slate-400 text-sm mt-1">{settings.jazzcashTitle}</p>}
              {settings.jazzcashNumber && <p className="text-green-400 font-mono font-semibold mt-1">{settings.jazzcashNumber}</p>}
            </CardContent>
          </Card>
        )}

        {settings?.easypaisaEnabled && (
          <Card className={`bg-slate-900 border-slate-800 cursor-pointer transition-all ${form.method === 'easypaisa' ? 'border-green-500 ring-2 ring-green-500/30' : 'hover:border-slate-700'}`}
            onClick={() => setForm({ ...form, method: 'easypaisa' })}>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold">EasyPaisa</h3>
              {settings.easypaisaTitle && <p className="text-slate-400 text-sm mt-1">{settings.easypaisaTitle}</p>}
              {settings.easypaisaNumber && <p className="text-green-400 font-mono font-semibold mt-1">{settings.easypaisaNumber}</p>}
            </CardContent>
          </Card>
        )}

        {settings?.qrEnabled && (
          <Card className={`bg-slate-900 border-slate-800 cursor-pointer transition-all ${form.method === 'qr' ? 'border-green-500 ring-2 ring-green-500/30' : 'hover:border-slate-700'}`}
            onClick={() => setForm({ ...form, method: 'qr' })}>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold">QR Code</h3>
              {settings.qrTitle && <p className="text-slate-400 text-sm mt-1">{settings.qrTitle}</p>}
              {settings.qrCode && <img src={settings.qrCode} alt="QR Code" className="w-24 h-24 mx-auto mt-2 rounded-lg" />}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Deposit Form */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Submit Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {success && <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm">{success}</div>}
          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Amount (Rs.)</Label>
                <Input type="number" min="10" step="1" placeholder="Enter amount" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="mt-1 bg-slate-800 border-slate-700 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Transaction ID / Reference</Label>
                <Input placeholder="e.g., 1234567890" value={form.transactionId}
                  onChange={e => setForm({ ...form, transactionId: e.target.value })}
                  className="mt-1 bg-slate-800 border-slate-700 text-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Sender Name / Account Number (Optional)</Label>
              <Input placeholder="Sender info" value={form.senderInfo}
                onChange={e => setForm({ ...form, senderInfo: e.target.value })}
                className="mt-1 bg-slate-800 border-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">Payment Screenshot</Label>
              <div className="mt-1 flex items-center gap-4">
                <label className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-slate-700 transition-all">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-sm">{form.screenshot ? 'Change file' : 'Upload screenshot'}</span>
                  <input type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
                </label>
                {form.screenshot && <span className="text-green-400 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> File selected</span>}
              </div>
            </div>
            <Button type="submit" disabled={submitting}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              {submitting ? 'Submitting...' : 'Submit Payment Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Deposit History */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Deposit History</CardTitle>
        </CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No deposits yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="text-left py-2 px-3">ID</th>
                    <th className="text-left py-2 px-3">Amount</th>
                    <th className="text-left py-2 px-3">Method</th>
                    <th className="text-left py-2 px-3">Transaction ID</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map(d => (
                    <tr key={d.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-white font-mono text-xs">#{d.id.slice(-6).toUpperCase()}</td>
                      <td className="py-2 px-3 text-white font-semibold">{formatCurrency(d.amount)}</td>
                      <td className="py-2 px-3 text-slate-300 capitalize">{d.method}</td>
                      <td className="py-2 px-3 text-slate-300 font-mono text-xs">{d.transactionId || '-'}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          {statusIcon(d.status)}
                          <Badge className={`text-xs ${statusColor(d.status)}`}>{d.status}</Badge>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-xs">{formatDate(d.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
