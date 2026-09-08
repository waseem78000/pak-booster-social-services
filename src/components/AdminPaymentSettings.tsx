import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Settings, Save, CheckCircle } from 'lucide-react'

export default function AdminPaymentSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.getPaymentSettings().then(d => setSettings(d.settings)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updatePaymentSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {} finally { setSaving(false) }
  }

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setSettings({ ...settings, qrCode: reader.result })
    reader.readAsDataURL(file)
  }

  if (loading) return <div className="bg-slate-900 rounded-xl h-64 animate-pulse" />

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Settings</h1>
          <p className="text-slate-400">Manage payment methods shown to users</p>
        </div>
        <Button onClick={handleSave} disabled={saving}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
          {saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Saved!</> : <><Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}</>}
        </Button>
      </div>

      {/* JazzCash */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 text-xs font-bold">JC</span>
            </div>
            JazzCash
          </CardTitle>
          <Switch checked={settings?.jazzcashEnabled || false}
            onCheckedChange={(v) => setSettings({ ...settings, jazzcashEnabled: v })} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300">Account Title</Label>
            <Input value={settings?.jazzcashTitle || ''} onChange={e => setSettings({ ...settings, jazzcashTitle: e.target.value })}
              placeholder="Account holder name" className="mt-1 bg-slate-800 border-slate-700 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">JazzCash Number</Label>
            <Input value={settings?.jazzcashNumber || ''} onChange={e => setSettings({ ...settings, jazzcashNumber: e.target.value })}
              placeholder="03XX XXXXXXX" className="mt-1 bg-slate-800 border-slate-700 text-white" />
          </div>
        </CardContent>
      </Card>

      {/* EasyPaisa */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 text-xs font-bold">EP</span>
            </div>
            EasyPaisa
          </CardTitle>
          <Switch checked={settings?.easypaisaEnabled || false}
            onCheckedChange={(v) => setSettings({ ...settings, easypaisaEnabled: v })} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300">Account Title</Label>
            <Input value={settings?.easypaisaTitle || ''} onChange={e => setSettings({ ...settings, easypaisaTitle: e.target.value })}
              placeholder="Account holder name" className="mt-1 bg-slate-800 border-slate-700 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">EasyPaisa Number</Label>
            <Input value={settings?.easypaisaNumber || ''} onChange={e => setSettings({ ...settings, easypaisaNumber: e.target.value })}
              placeholder="03XX XXXXXXX" className="mt-1 bg-slate-800 border-slate-700 text-white" />
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 text-xs font-bold">QR</span>
            </div>
            QR Code
          </CardTitle>
          <Switch checked={settings?.qrEnabled || false}
            onCheckedChange={(v) => setSettings({ ...settings, qrEnabled: v })} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300">Title / Description</Label>
            <Input value={settings?.qrTitle || ''} onChange={e => setSettings({ ...settings, qrTitle: e.target.value })}
              placeholder="Scan to pay" className="mt-1 bg-slate-800 border-slate-700 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">QR Code Image</Label>
            <div className="mt-2 flex items-center gap-4">
              <label className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-slate-700 transition-all">
                <span className="text-white text-sm">{settings?.qrCode ? 'Replace QR' : 'Upload QR Code'}</span>
                <input type="file" accept="image/*" onChange={handleQRUpload} className="hidden" />
              </label>
            </div>
            {settings?.qrCode && (
              <img src={settings.qrCode} alt="QR Code" className="w-32 h-32 mt-3 rounded-lg border border-slate-700" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
