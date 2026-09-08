import { useState, useEffect } from 'react'
import { api, formatCurrency } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tag, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '', platform: 'YouTube', price: '', duration: '30', views: '0', subscribers: '0', features: '', status: 'active' })

  useEffect(() => { loadPlans() }, [])

  const loadPlans = async () => {
    try { const data = await api.getAdminPlans(); setPlans(data.plans || []) } catch {} finally { setLoading(false) }
  }

  const platforms = ['YouTube', 'Instagram', 'TikTok', 'Facebook', 'Twitter/X', 'Telegram', 'Other']

  const openDialog = (plan?: any) => {
    if (plan) {
      setEditing(plan)
      setForm({
        name: plan.name, description: plan.description || '', platform: plan.platform,
        price: String(plan.price), duration: String(plan.duration), views: String(plan.views),
        subscribers: String(plan.subscribers), features: plan.features || '', status: plan.status
      })
    } else {
      setEditing(null)
      setForm({ name: '', description: '', platform: 'YouTube', price: '', duration: '30', views: '0', subscribers: '0', features: '', status: 'active' })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const data = {
      ...form, price: parseFloat(form.price), duration: parseInt(form.duration),
      views: parseInt(form.views), subscribers: parseInt(form.subscribers)
    }
    if (editing) { await api.updatePlan(editing.id, data) }
    else { await api.createPlan(data) }
    setDialogOpen(false)
    loadPlans()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this plan?')) { await api.deletePlan(id); loadPlans() }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Plans</h1>
          <p className="text-slate-400">{plans.length} total plans</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Plan
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="bg-slate-900 rounded-xl h-48 animate-pulse" />)}</div>
      ) : plans.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800"><CardContent className="p-12 text-center"><Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No plans yet</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(p => (
            <Card key={p.id} className="bg-slate-900 border-slate-800 hover:border-purple-500/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-purple-500/20 text-purple-300">{p.platform}</Badge>
                  <div className="flex gap-1">
                    <button onClick={() => openDialog(p)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-lg">{p.name}</h3>
                {p.description && <p className="text-slate-400 text-sm mt-1">{p.description}</p>}
                <div className="mt-3 space-y-1 text-sm">
                  {p.views > 0 && <p className="text-slate-300">👁 Views: {p.views.toLocaleString()}</p>}
                  {p.subscribers > 0 && <p className="text-slate-300">👤 Subscribers: {p.subscribers.toLocaleString()}</p>}
                  <p className="text-slate-300">📅 Duration: {p.duration} Days</p>
                  {p.features && <p className="text-slate-400 text-xs">Features: {p.features}</p>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-purple-400 font-bold text-xl">{formatCurrency(p.price)}</p>
                  <Badge className={p.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>{p.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Plan' : 'Add Plan'}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label className="text-slate-300">Plan Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 bg-slate-800 border-slate-700" />
            </div>
            <div>
              <Label className="text-slate-300">Description</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 bg-slate-800 border-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">Platform</Label>
                <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
                  className="mt-1 w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm">
                  {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-slate-300">Price (Rs.)</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1 bg-slate-800 border-slate-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">Duration (Days)</Label>
                <Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="mt-1 bg-slate-800 border-slate-700" />
              </div>
              <div>
                <Label className="text-slate-300">Views</Label>
                <Input type="number" value={form.views} onChange={e => setForm({ ...form, views: e.target.value })} className="mt-1 bg-slate-800 border-slate-700" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Subscribers</Label>
              <Input type="number" value={form.subscribers} onChange={e => setForm({ ...form, subscribers: e.target.value })} className="mt-1 bg-slate-800 border-slate-700" />
            </div>
            <div>
              <Label className="text-slate-300">Features (comma separated)</Label>
              <Input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Views, Subscribers, Likes" className="mt-1 bg-slate-800 border-slate-700" />
            </div>
            <Button onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              {editing ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
