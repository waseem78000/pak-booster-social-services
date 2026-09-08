import { useState, useEffect } from 'react'
import { api, formatDate } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle, AlertCircle, Info, CheckCheck } from 'lucide-react'

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadNotifications() }, [])

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications()
      setNotifications(data.notifications || [])
    } catch {} finally { setLoading(false) }
  }

  const markRead = async (id: string) => {
    await api.markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n))
  }

  const markAllRead = async () => {
    await api.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })))
  }

  const icon = (type: string) => {
    if (type === 'success') return <CheckCircle className="w-5 h-5 text-green-400" />
    if (type === 'error') return <AlertCircle className="w-5 h-5 text-red-400" />
    return <Info className="w-5 h-5 text-blue-400" />
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400">Stay updated on your account</p>
        </div>
        {notifications.some(n => !n.readStatus) && (
          <Button onClick={markAllRead} variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
            <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-slate-900 rounded-xl h-20 animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Card key={n.id} className={`bg-slate-900 border-slate-800 transition-all ${!n.readStatus ? 'border-l-2 border-l-purple-500' : 'opacity-60'}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="mt-0.5">{icon(n.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-sm">{n.title}</h3>
                    {!n.readStatus && (
                      <button onClick={() => markRead(n.id)} className="text-purple-400 hover:text-purple-300 text-xs">Mark read</button>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{n.message}</p>
                  <p className="text-slate-500 text-xs mt-2">{formatDate(n.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
