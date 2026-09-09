import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react'

interface AuthProps {
  onAuth: (token: string, user: any, role?: 'user' | 'admin') => void
  onBack?: () => void
}

export default function Auth({ onAuth, onBack }: AuthProps) {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', username: '', password: '', name: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Check admin credentials from localStorage
      let adminCreds = { username: 'admin', password: 'admin123', email: 'seemi78000@gmail.com' }
      try {
        const raw = localStorage.getItem('pakbooster_admin_creds')
        if (raw) adminCreds = { ...adminCreds, ...JSON.parse(raw) }
      } catch {}

      const isEmail = form.email.includes('@')

      // Admin check: email match OR username match
      if (tab === 'login' && ((isEmail && form.email === adminCreds.email) || (!isEmail && form.email === adminCreds.username))) {
        if (form.password === adminCreds.password) {
          const token = 'admin_token_' + Date.now()
          localStorage.setItem('smm_admin_token', token)
          onAuth(token, { username: adminCreds.username, email: adminCreds.email, role: 'admin' }, 'admin')
          return
        }
      }

      // Normal user login
      if (tab === 'login') {
        const data = await api.login({ email: form.email, password: form.password })
        localStorage.setItem('smm_token', data.token)
        onAuth(data.token, data.user, 'user')
      } else {
        const data = await api.register({ email: form.email, username: form.username, password: form.password, name: form.name })
        localStorage.setItem('smm_token', data.token)
        onAuth(data.token, data.user, 'user')
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-[#0a0f1a] to-teal-900/20" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-xl shadow-emerald-500/25">
            <svg width="36" height="36" viewBox="0 0 52 52" fill="none">
              <circle cx="28" cy="26" r="12" fill="white" />
              <circle cx="32" cy="23" r="10" fill="url(#authGrad2)" />
              <path d="M36 26l-2.12 6.53h-6.88l5.57-4.03-2.12-6.53 5.55 4.03z" fill="white" />
              <defs><linearGradient id="authGrad2" x1="0" y1="0" x2="52" y2="52"><stop stopColor="#00a651" /><stop offset="1" stopColor="#008a44" /></linearGradient></defs>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">PAK BOOSTER</h1>
          <p className="text-emerald-400 mt-1 text-xs tracking-[0.25em] font-semibold uppercase">Social Services</p>
          {onBack && (
            <button onClick={onBack} className="mt-3 text-emerald-300 hover:text-white text-sm underline transition-colors">
              ← Back to Home
            </button>
          )}
        </div>

        <Card className="bg-[#111b2e]/80 backdrop-blur-xl border-[#1a2744] shadow-2xl shadow-emerald-500/5">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {tab === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-slate-400 text-center">
              {tab === 'login' ? 'Sign in with your email or username' : 'Join thousands of customers'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-[#162032]">
                <TabsTrigger value="login" className="text-slate-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-medium">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-slate-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-medium">Register</TabsTrigger>
              </TabsList>
            </Tabs>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <>
                  <div>
                    <Label className="text-slate-300 font-medium">Full Name</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        placeholder="John Doe"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="pl-10 bg-[#111b2e] border-[#1a2744] text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 font-medium">Username</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        placeholder="johndoe"
                        value={form.username}
                        onChange={e => setForm({ ...form, username: e.target.value })}
                        className="pl-10 bg-[#111b2e] border-[#1a2744] text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label className="text-slate-300 font-medium">Email or Username</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="you@example.com or username"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="pl-10 bg-[#111b2e] border-[#1a2744] text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-300 font-medium">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="pl-10 pr-10 bg-[#111b2e] border-[#1a2744] text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all">
                {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-slate-500 text-xs">
                Admin? Use admin email/username + password to login
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
