import { useState, useEffect } from 'react'
import { api, formatCurrency } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShoppingCart, AlertCircle, CheckCircle, Minus, Plus } from 'lucide-react'

export default function NewOrder({ user, onNavigate }: { user: any; onNavigate: (p: string) => void }) {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ category: '', serviceId: '', link: '', quantity: '' })
  const [selectedService, setSelectedService] = useState<any>(null)

  useEffect(() => {
    api.getServices().then(d => setServices(d.services || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(services.map(s => s.category))]
  const filteredServices = form.category ? services.filter(s => s.category === form.category) : services

  useEffect(() => {
    if (form.serviceId) {
      setSelectedService(services.find(s => s.id === form.serviceId))
    }
  }, [form.serviceId, services])

  const totalPrice = selectedService && form.quantity ? parseFloat((selectedService.price * parseInt(form.quantity)).toFixed(2)) : 0
  const balanceAfter = (user?.walletBalance || 0) - totalPrice
  const hasEnoughBalance = balanceAfter >= 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.serviceId) { setError('Please select a service'); return }
    if (!form.link) { setError('Please enter a link'); return }
    if (!form.quantity || parseInt(form.quantity) <= 0) { setError('Please enter a valid quantity'); return }
    if (selectedService && (parseInt(form.quantity) < selectedService.minQuantity || parseInt(form.quantity) > selectedService.maxQuantity)) {
      setError(`Quantity must be between ${selectedService.minQuantity} and ${selectedService.maxQuantity}`); return
    }
    if (!hasEnoughBalance) { setError('Insufficient balance. Please add funds.'); return }

    setSubmitting(true)
    try {
      await api.createOrder({ serviceId: form.serviceId, link: form.link, quantity: parseInt(form.quantity) })
      setSuccess('Order submitted successfully!')
      setForm({ category: form.category, serviceId: '', link: '', quantity: '' })
      setSelectedService(null)
    } catch (e: any) { setError(e.message || 'Failed to create order') } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">New Order</h1>
        <p className="text-slate-400">Place a new SMM order</p>
      </div>

      {loading ? (
        <div className="bg-slate-900 rounded-xl h-64 animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4 bg-red-500/10 border-red-500/30">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 bg-green-500/10 border-green-500/30">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300">{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Category</Label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value, serviceId: '' })}
                      className="mt-1 w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">All Categories</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Service</Label>
                    <select value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })}
                      className="mt-1 w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Select a service</option>
                      {filteredServices.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}/unit</option>
                      ))}
                    </select>
                  </div>

                  {selectedService && (
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-1 text-sm">
                      <p className="text-slate-400"><span className="text-white">Description:</span> {selectedService.description}</p>
                      <p className="text-slate-400"><span className="text-white">Price:</span> {formatCurrency(selectedService.price)}/unit</p>
                      <p className="text-slate-400"><span className="text-white">Min Qty:</span> {selectedService.minQuantity.toLocaleString()}</p>
                      <p className="text-slate-400"><span className="text-white">Max Qty:</span> {selectedService.maxQuantity.toLocaleString()}</p>
                      {selectedService.avgStartTime && <p className="text-slate-400"><span className="text-white">Start Time:</span> {selectedService.avgStartTime}</p>}
                    </div>
                  )}

                  <div>
                    <Label className="text-slate-300">Link</Label>
                    <Input placeholder="https://instagram.com/username" value={form.link}
                      onChange={e => setForm({ ...form, link: e.target.value })}
                      className="mt-1 bg-slate-800 border-slate-700 text-white" />
                  </div>

                  <div>
                    <Label className="text-slate-300">Quantity</Label>
                    <Input type="number" min={selectedService?.minQuantity || 1} max={selectedService?.maxQuantity || 999999}
                      placeholder="Enter quantity" value={form.quantity}
                      onChange={e => setForm({ ...form, quantity: e.target.value })}
                      className="mt-1 bg-slate-800 border-slate-700 text-white" />
                  </div>

                  {!hasEnoughBalance && form.quantity && selectedService && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-300 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Insufficient Balance – Please Add Funds
                      </p>
                    </div>
                  )}

                  <Button type="submit" disabled={submitting || !hasEnoughBalance}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-slate-900 border-slate-800 sticky top-20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Service</span>
                  <span className="text-white">{selectedService?.name || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Price/Unit</span>
                  <span className="text-white">{selectedService ? formatCurrency(selectedService.price) : '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Quantity</span>
                  <span className="text-white">{form.quantity ? parseInt(form.quantity).toLocaleString() : '-'}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between">
                  <span className="text-white font-semibold">Total Cost</span>
                  <span className="text-purple-400 font-bold text-lg">{totalPrice > 0 ? formatCurrency(totalPrice) : '-'}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between text-sm">
                  <span className="text-slate-400">Current Balance</span>
                  <span className="text-green-400">{formatCurrency(user?.walletBalance || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Balance After</span>
                  <span className={balanceAfter >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {totalPrice > 0 ? formatCurrency(balanceAfter) : '-'}
                  </span>
                </div>
                <Button onClick={() => onNavigate('add-funds')} variant="outline"
                  className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                  Add Funds
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
