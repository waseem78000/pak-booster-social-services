import { Card, CardContent } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export default function AdminNotifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400">Admin notification center</p>
      </div>
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-12 text-center">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Admin notifications will appear here</p>
          <p className="text-slate-500 text-sm mt-1">System-wide notifications and alerts</p>
        </CardContent>
      </Card>
    </div>
  )
}
