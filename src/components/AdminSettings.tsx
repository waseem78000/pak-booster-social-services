import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { User, Lock, Mail, Phone, Instagram, Youtube, Facebook, Twitter, MessageCircle, Save, CheckCircle, AlertCircle } from 'lucide-react'

const SETTINGS_KEY = 'pakbooster_site_settings'
const CREDS_KEY = 'pakbooster_admin_creds'

const defaultSettings = {
  siteName: 'PAK BOOSTER',
  siteTagline: 'Social Services',
  adminName: 'Waseem Abbas',
  adminPhone: '03479178048',
  adminEmail: 'Seemi78000@gmail.com',
  adminWhatsapp: '03479178048',
  instagram: '',
  youtube: '',
  facebook: '',
  twitter: '',
  telegram: '',
}

const defaultCreds = {
  username: 'admin',
  password: 'admin123',
  email: 'seemi78000@gmail.com',
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
  } catch { return defaultSettings }
}

function saveSettings(s: typeof defaultSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

function loadCreds() {
  try {
    const raw = localStorage.getItem(CREDS_KEY)
    return raw ? { ...defaultCreds, ...JSON.parse(raw) } : defaultCreds
  } catch { return defaultCreds }
}

function saveCreds(c: typeof defaultCreds) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(c))
}

export function getSiteSettings() { return loadSettings() }
export function getAdminCreds() { return loadCreds() }

export default function AdminSettings() {
  const [saving, setSaving] = useState(false)
  const [credSaving, setCredSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [credSuccess, setCredSuccess] = useState('')
  const [error, setError] = useState('')
  const [credError, setCredError] = useState('')

  const [settings, setSettings] = useState(defaultSettings)
  const [credentials, setCredentials] = useState({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '', email: '' })

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const handleSaveContact = () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      saveSettings(settings)
      setSuccess('✅ Contact info saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangeCredentials = () => {
    setCredSaving(true)
    setCredError('')
    setCredSuccess('')
    try {
      const currentCreds = loadCreds()

      if (!credentials.currentPassword) {
        throw new Error('Current password is required')
      }
      if (credentials.currentPassword !== currentCreds.password) {
        throw new Error('Current password is incorrect')
      }
      if (credentials.newPassword && credentials.newPassword !== credentials.confirmPassword) {
        throw new Error('New passwords do not match')
      }
      if (credentials.newPassword && credentials.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      if (!credentials.newUsername && !credentials.newPassword && !credentials.email) {
        throw new Error('Enter at least one field to update')
      }

      const updated = { ...currentCreds }
      if (credentials.newUsername) updated.username = credentials.newUsername
      if (credentials.newPassword) updated.password = credentials.newPassword
      if (credentials.email) updated.email = credentials.email

      saveCreds(updated)
      setCredSuccess('✅ Credentials updated successfully!')
      setCredentials({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '', email: '' })
      setTimeout(() => setCredSuccess(''), 3000)
    } catch (e: any) {
      setCredError(e.message)
    } finally {
      setCredSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
        <p className="text-slate-400">Manage admin credentials & site contact info</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            Admin Credentials
          </CardTitle>
          <CardDescription className="text-slate-400">Change your admin username & password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {credError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {credError}
            </div>
          )}
          {credSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> {credSuccess}
            </div>
          )}

          <div>
            <Label className="text-slate-300 text-sm font-medium">Current Password *</Label>
            <Input type="password" placeholder="Enter current password" value={credentials.currentPassword}
              onChange={e => setCredentials({ ...credentials, currentPassword: e.target.value })}
              className="bg-[#111b2e] border-[#1a2744] text-white mt-1.5" />
          </div>

          <Separator className="bg-slate-800" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm font-medium">New Username</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder="Leave blank to keep current" value={credentials.newUsername}
                  onChange={e => setCredentials({ ...credentials, newUsername: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm font-medium">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder="Leave blank to keep current" value={credentials.email}
                  onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm font-medium">New Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input type="password" placeholder="Min 6 characters" value={credentials.newPassword}
                  onChange={e => setCredentials({ ...credentials, newPassword: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm font-medium">Confirm New Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input type="password" placeholder="Re-enter new password" value={credentials.confirmPassword}
                  onChange={e => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
          </div>

          <Button onClick={handleChangeCredentials} disabled={credSaving}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold">
            {credSaving ? 'Updating...' : 'Update Credentials'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-400" />
            Site Contact Info
          </CardTitle>
          <CardDescription className="text-slate-400">Your contact details shown to users on the site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm font-medium">Admin Name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder="Waseem Abbas" value={settings.adminName}
                  onChange={e => setSettings({ ...settings, adminName: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm font-medium">Phone Number</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder="03479178048" value={settings.adminPhone}
                  onChange={e => setSettings({ ...settings, adminPhone: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm font-medium">Gmail / Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder="your.email@gmail.com" value={settings.adminEmail}
                  onChange={e => setSettings({ ...settings, adminEmail: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm font-medium">WhatsApp</Label>
              <div className="relative mt-1.5">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder="03479178048" value={settings.adminWhatsapp}
                  onChange={e => setSettings({ ...settings, adminWhatsapp: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
          </div>

          <Separator className="bg-slate-800" />
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Social Media Links</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm font-medium">Instagram URL</Label>
              <div className="relative mt-1.5">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder="https://instagram.com/username" value={settings.instagram}
                  onChange={e => setSettings({ ...settings, instagram: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm font-medium">YouTube URL</Label>
              <div className="relative mt-1.5">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder="https://youtube.com/@channel" value={settings.youtube}
                  onChange={e => setSettings({ ...settings, youtube: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm font-medium">Facebook URL</Label>
              <div className="relative mt-1.5">
                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder="https://facebook.com/page" value={settings.facebook}
                  onChange={e => setSettings({ ...settings, facebook: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm font-medium">Twitter/X URL</Label>
              <div className="relative mt-1.5">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder="https://x.com/username" value={settings.twitter}
                  onChange={e => setSettings({ ...settings, twitter: e.target.value })}
                  className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-slate-300 text-sm font-medium">Telegram URL</Label>
            <div className="relative mt-1.5">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input placeholder="https://t.me/channel" value={settings.telegram}
                onChange={e => setSettings({ ...settings, telegram: e.target.value })}
                className="pl-10 bg-[#111b2e] border-[#1a2744] text-white" />
            </div>
          </div>

          <Button onClick={handleSaveContact} disabled={saving}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Contact Info'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
