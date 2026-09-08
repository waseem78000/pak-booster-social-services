import { useState, useEffect } from 'react'
import { api, formatCurrency } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Zap } from 'lucide-react'

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', category: 'Instagram', description: '', price: '', minQuantity: '100', maxQuantity: '100000', avgStartTime: '', speed: '', status: 'active' })

  useEffect(() => { loadServices() }, [])

  const loadServices = async () => {
    try {
      const data = await api.getAdminServices()
      setServices(data.services || [])
    } catch {} finally { setLoading(false) }
  }

  const categories = ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'Telegram', 'Twitter/X', 'Other']

  const openDialog = (service?: any) => {
    if (service) {
      setEditing(service)
      setForm({
        name: service.name, category: service.category, description: service.description || '',
        price: String(service.price), minQuantity: String(service.minQuantity), maxQuantity: String(service.maxQuantity),
        avgStartTime: service.avgStartTime || '', speed: service.speed || '', status: service.status
      })
    } else {
      setEditing(null)
      setForm({ name: '', category: 'Instagram', description: '', price: '', minQuantity: '100', maxQuantity: '100000', avgStartTime: '', speed: '', status: 'active' })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const data = { ...form, price: parseFloat(form.price), minQuantity: parseInt(form.minQuantity), maxQuantity: parseInt(form.maxQuantity) }
    if (editing) {
      await api.updateService(editing.id, data)
    } else {
      await api.createService(data)
    }
    setDialogOpen(false)
    loadServices()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this service?')) {
      await api.deleteService(id)
      loadServices()
    }
  }

  const toggleStatus = async (service: any) => {
    await api.updateService(service.id, { status: service.status === 'active' ? 'inactive' : 'active' })
    loadServices()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Services</h1>
          <p className="text-slate-400">{services.length} total services</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-slate-900 rounded-xl h-20 animate-pulse" />)}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="text-left py-3 px-4">Service</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-right py-3 px-4">Price</th>
                <th className="text-center py-3 px-4">Min/Max</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <p className="text-white font-medium">{s.name}</p>
                    <p className="text-slate-400 text-xs">{s.description}</p>
                  </td>
                  <td className="py-3 px-4"><Badge className="bg-purple-500/20 text-purple-300">{s.category}</Badge></td>
                  <td className="py-3 px-4 text-right text-white">{formatCurrency(s.price)}/unit</td>
                  <td className="py-3 px-4 text-center text-slate-300 text-xs">{s.minQuantity.toLocaleString()} - {s.maxQuantity.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => toggleStatus(s)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${s.status === 'active' ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'}`}>
                      {s.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openDialog(s)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label className="text-slate-300">Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 bg-slate-800 border-slate-700" />
            </div>
            <div>
              <Label className="text-slate-300">Category</Label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-slate-300">Description</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 bg-slate-800 border-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">Price (per unit)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1 bg-slate-800 border-slate-700" />
              </div>
              <div>
                <Label className="text-slate-300">Min Quantity</Label>
                <Input type="number" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} className="mt-1 bg-slate-800 border-slate-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">Max Quantity</Label>
                <Input type="number" value={form.maxQuantity} onChange={e => setForm({ ...form, maxQuantity: e.target.value })} className="mt-1 bg-slate-800 border-slate-700" />
              </div>
              <div>
                <Label className="text-slate-300">Avg Start Time</Label>
                <Input value={form.avgStartTime} onChange={e => setForm({ ...form, avgStartTime: e.target.value })} placeholder="e.g., 1-2 hours" className="mt-1 bg-slate-800 border-slate-700" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Speed</Label>
              <Input value={form.speed} onChange={e => setForm({ ...form, speed: e.target.value })} placeholder="e.g., 1000/day" className="mt-1 bg-slate-800 border-slate-700" />
            </div>
            <div>
              <Label className="text-slate-300">Status</Label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="mt-1 w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <Button onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              {editing ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
