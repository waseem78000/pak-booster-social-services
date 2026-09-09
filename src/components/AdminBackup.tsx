import { useState, useRef } from 'react'
import { api, formatCurrency, formatDate } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Upload, AlertTriangle, CheckCircle, Database, Shield, Clock, FileJson } from 'lucide-react'
import { theme } from '@/lib/theme'

export default function AdminBackup({ isDark }: { isDark: boolean }) {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [importFile, setImportFile] = useState<any>(null)
  const [importPreview, setImportPreview] = useState<any>(null)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = isDark ? theme.dark : theme.light

  const handleExport = async () => {
    setExporting(true)
    setError('')
    setResult(null)
    try {
      const backup = await api.exportBackup()
      const json = JSON.stringify(backup, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `pak-booster-backup-${date}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setResult({ type: 'export', counts: backup.counts, exportedAt: backup.exportedAt })
    } catch (e: any) {
      setError(e.message || 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setImportPreview(null)
    setConfirmRestore(false)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!data?.data) {
          setError('Invalid backup file — missing data field')
          return
        }
        setImportFile(data)
        setImportPreview(data.counts || {})
      } catch {
        setError('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImport = async () => {
    if (!importFile || !confirmRestore) return
    setImporting(true)
    setError('')
    setResult(null)
    try {
      const res = await api.importBackup(importFile)
      setResult({ type: 'import', results: res.results, message: res.message })
      setImportFile(null)
      setImportPreview(null)
      setConfirmRestore(false)
    } catch (e: any) {
      setError(e.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const modelLabels: Record<string, string> = {
    users: 'Users',
    adminUsers: 'Admin Users',
    services: 'Services',
    deposits: 'Deposits',
    orders: 'Orders',
    walletTransactions: 'Wallet Transactions',
    notifications: 'Notifications',
    supportTickets: 'Support Tickets',
    plans: 'Plans',
    userPlans: 'User Plans',
    paymentSettings: 'Payment Settings',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${t.text} flex items-center gap-2`}>
          <Shield className="w-6 h-6 text-emerald-400" />
          Backup & Restore
        </h1>
        <p className={`${t.textSub} mt-1`}>Export your complete data or restore from a previous backup before deploying.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-emerald-400 font-medium text-sm">
              {result.type === 'export' ? '✅ Backup exported successfully!' : '✅ Data restored successfully!'}
            </p>
            {result.type === 'export' && result.counts && (
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(result.counts).map(([key, count]) => (
                  <Badge key={key} variant="outline" className={`${t.border} ${t.textSub} text-xs`}>
                    {modelLabels[key] || key}: {String(count)}
                  </Badge>
                ))}
              </div>
            )}
            {result.type === 'import' && result.results && (
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(result.results).map(([key, count]) => (
                  <Badge key={key} variant="outline" className={`${t.border} ${t.textSub} text-xs`}>
                    {modelLabels[key] || key}: {String(count)} restored
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export */}
        <Card className={`${t.bgCard} border ${t.border}`}>
          <CardHeader>
            <CardTitle className={`${t.text} flex items-center gap-2 text-lg`}>
              <Download className="w-5 h-5 text-emerald-400" />
              Export Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`${t.textSub} text-sm`}>
              Download a complete JSON backup of all your data — users, orders, deposits, services, transactions, everything.
            </p>
            <div className={`${isDark ? 'bg-[#111b2e]' : 'bg-emerald-50'} rounded-xl p-4 space-y-2`}>
              <div className="flex items-center gap-2 text-sm">
                <Database className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`${t.text} font-medium`}>What gets exported:</span>
              </div>
              <div className="grid grid-cols-2 gap-1 pl-6">
                {Object.values(modelLabels).map(label => (
                  <span key={label} className={`${t.textSub} text-xs`}>• {label}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-400/80">
              <Clock className="w-3.5 h-3.5" />
              <span>Keep this file safe — it contains all user data</span>
            </div>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold"
            >
              {exporting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Backup
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card className={`${t.bgCard} border ${t.border}`}>
          <CardHeader>
            <CardTitle className={`${t.text} flex items-center gap-2 text-lg`}>
              <Upload className="w-5 h-5 text-blue-400" />
              Restore Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`${t.textSub} text-sm`}>
              Restore data from a previously exported backup file. <span className="text-red-400 font-medium">This replaces ALL current data.</span>
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />

            {!importFile ? (
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className={`w-full ${t.border} ${t.text} hover:${t.hoverItem} border-dashed border-2`}
              >
                <span className="flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  Choose Backup File (.json)
                </span>
              </Button>
            ) : (
              <div className="space-y-3">
                <div className={`${isDark ? 'bg-[#111b2e]' : 'bg-blue-50'} rounded-xl p-4 space-y-2`}>
                  <p className={`${t.text} text-sm font-medium`}>📋 Backup Preview:</p>
                  <div className="grid grid-cols-2 gap-1 pl-2">
                    {Object.entries(importPreview).map(([key, count]) => (
                      <span key={key} className={`${t.textSub} text-xs`}>
                        • {modelLabels[key] || key}: <span className={`${t.text} font-medium`}>{String(count)}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-400 text-xs font-medium">⚠️ Warning: This will DELETE all existing data and replace with backup data.</p>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmRestore}
                        onChange={(e) => setConfirmRestore(e.target.checked)}
                        className="rounded border-red-500/50"
                      />
                      <span className="text-red-300 text-xs">I understand, replace all data</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleImport}
                    disabled={importing || !confirmRestore}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold disabled:opacity-50"
                  >
                    {importing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Restoring...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Restore Now
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={() => { setImportFile(null); setImportPreview(null); setConfirmRestore(false) }}
                    variant="outline"
                    className={`${t.border} ${t.text}`}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deploy Tips */}
      <Card className={`${t.bgCard} border ${t.border}`}>
        <CardHeader>
          <CardTitle className={`${t.text} text-lg`}>💡 Deploy Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`space-y-3 ${t.textSub} text-sm`}>
            <div className="flex items-start gap-3">
              <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <p><span className={`${t.text} font-medium`}>Before deploying</span> — Click "Download Backup" to save your data</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-500/20 text-blue-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <p><span className={`${t.text} font-medium`}>Deploy to Vercel</span> — Push to GitHub, Vercel will auto-deploy</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-amber-500/20 text-amber-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <p><span className={`${t.text} font-medium`}>After deploy</span> — Login as admin, go to this page, upload backup and restore</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
