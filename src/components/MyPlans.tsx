import { useState, useEffect } from 'react'
import { api, formatCurrency, formatDate } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tag, Eye, Users, Calendar, ShoppingCart } from 'lucide-react'

export default function MyPlans() {
  const [plans, setPlans] = useState<any[]>([])
  const [allPlans, setAllPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getUserPlans().catch(() => ({ userPlans: [] })),
      api.getPlans().catch(() => ({ plans: [] }))
    ]).then(([up, p]) => {
      setPlans(up.userPlans || [])
      setAllPlans(p.plans || [])
    }).finally(() => setLoading(false))
  }, [])

  const statusColor = (s: string) => {
    const m: Record<string, string> = { active: 'bg-green-500/20 text-green-300', expired: 'bg-red-500/20 text-red-300', cancelled: 'bg-slate-500/20 text-slate-300' }
    return m[s] || 'bg-slate-500/20 text-slate-300'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Plans</h1>
        <p className="text-slate-400">View your active and available plans</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-slate-900 rounded-xl h-48 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Active Plans */}
          {plans.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Active Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((up: any) => (
                  <Card key={up.id} className="bg-slate-900 border-slate-800 border-l-2 border-l-green-500">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold text-lg">{up.plan?.name}</h3>
                        <Badge className={statusColor(up.status)}>{up.status}</Badge>
                      </div>
                      {up.plan?.views ? (
                        <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
                          <Eye className="w-4 h-4 text-blue-400" /> Views: {up.plan.views.toLocaleString()}
                        </div>
                      ) : null}
                      {up.plan?.subscribers ? (
                        <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
                          <Users className="w-4 h-4 text-green-400" /> Subscribers: {up.plan.subscribers.toLocaleString()}
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
                        <ShoppingCart className="w-4 h-4 text-purple-400" /> Price: {formatCurrency(up.plan?.price || 0)}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <Calendar className="w-4 h-4 text-yellow-400" /> Expires: {formatDate(up.endDate)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Plans */}
          {allPlans.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Available Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPlans.map(p => (
                  <Card key={p.id} className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-purple-500/20 text-purple-300">{p.platform}</Badge>
                        <Badge className="bg-green-500/20 text-green-300">{p.duration} Days</Badge>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">{p.name}</h3>
                      {p.description && <p className="text-slate-400 text-sm mb-3">{p.description}</p>}
                      {p.views ? <p className="text-slate-300 text-sm">👁 Views: {p.views.toLocaleString()}</p> : null}
                      {p.subscribers ? <p className="text-slate-300 text-sm">👤 Subscribers: {p.subscribers.toLocaleString()}</p> : null}
                      {p.features && <p className="text-slate-400 text-xs mt-2">Features: {p.features}</p>}
                      <p className="text-purple-400 font-bold text-xl mt-3">{formatCurrency(p.price)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
