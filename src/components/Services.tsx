import { useState, useEffect } from 'react'
import { api, formatCurrency } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Zap, Search, Clock, Minus, Plus } from 'lucide-react'

export default function Services({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => { loadServices() }, [])

  const loadServices = async () => {
    try {
      const data = await api.getServices()
      setServices(data.services || [])
    } catch {} finally { setLoading(false) }
  }

  const categories = [...new Set(services.map(s => s.category))]
  const filtered = services.filter(s => {
    if (category !== 'all' && s.category !== category) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-slate-400">Browse and order social media services</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === 'all' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === c ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-slate-900 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 text-center">
            <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No services found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(service => (
            <Card key={service.id} className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-purple-500/20 text-purple-300">{service.category}</Badge>
                  <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">{service.name}</h3>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{service.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Price per unit</span>
                    <span className="text-white font-semibold">{formatCurrency(service.price)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Min / Max</span>
                    <span className="text-white">{service.minQuantity.toLocaleString()} - {service.maxQuantity.toLocaleString()}</span>
                  </div>
                  {service.avgStartTime && (
                    <div className="flex justify-between text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Start time</span>
                      <span className="text-white">{service.avgStartTime}</span>
                    </div>
                  )}
                  {service.speed && (
                    <div className="flex justify-between text-slate-400">
                      <span>Speed</span>
                      <span className="text-white">{service.speed}</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => onNavigate('new-order')}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  Order Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
