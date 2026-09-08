import { useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserCircle, Lock, CheckCircle, AlertCircle } from 'lucide-react'

export default function Profile({ user }: { user: any }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    if (!form.currentPassword || !form.newPassword) { setMessage({ type: 'error', text: 'All fields required' }); return }
    if (form.newPassword !== form.confirmPassword) { setMessage({ type: 'error', text: 'Passwords do not match' }); return }
    if (form.newPassword.length < 6) { setMessage({ type: 'error', text: 'Password must be at least 6 characters' }); return }
    setLoading(true)
    try {
      await api.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setMessage({ type: 'success', text: 'Password changed successfully' })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e: any) { setMessage({ type: 'error', text: e.message || 'Failed' }) } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400">Manage your account settings</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white">Account Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white text-lg font-semibold">{user?.name || user?.username}</p>
              <p className="text-slate-400">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400">Username</p>
              <p className="text-white font-medium">{user?.username}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400">Status</p>
              <p className="text-green-400 font-medium capitalize">{user?.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><Lock className="w-5 h-5" /> Change Password</CardTitle></CardHeader>
        <CardContent>
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label className="text-slate-300">Current Password</Label>
              <Input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                className="mt-1 bg-slate-800 border-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">New Password</Label>
              <Input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })}
                className="mt-1 bg-slate-800 border-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">Confirm New Password</Label>
              <Input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className="mt-1 bg-slate-800 border-slate-700 text-white" />
            </div>
            <Button type="submit" disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
