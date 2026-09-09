import { Mail, Phone, Instagram, Youtube, Facebook, Twitter, MessageCircle } from 'lucide-react'

interface SiteSettings {
  siteName: string
  siteTagline: string
  adminName: string
  adminPhone: string
  adminEmail: string
  adminWhatsapp: string
  instagram: string
  youtube: string
  facebook: string
  twitter: string
  telegram: string
}

const defaultSettings: SiteSettings = {
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

function loadSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem('pakbooster_site_settings')
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
  } catch { return defaultSettings }
}

interface FooterProps {
  isDark: boolean
}

export default function Footer({ isDark }: FooterProps) {
  const settings = loadSettings()

  const socialLinks = [
    { url: settings.instagram, icon: Instagram, label: 'Instagram', color: 'hover:text-pink-400' },
    { url: settings.youtube, icon: Youtube, label: 'YouTube', color: 'hover:text-red-400' },
    { url: settings.facebook, icon: Facebook, label: 'Facebook', color: 'hover:text-blue-400' },
    { url: settings.twitter, icon: Twitter, label: 'Twitter/X', color: 'hover:text-sky-400' },
    { url: settings.telegram, icon: MessageCircle, label: 'Telegram', color: 'hover:text-blue-300' },
  ].filter(l => l.url && l.url.trim() !== '')

  return (
    <footer className={`border-t ${isDark ? 'bg-[#0a0f1a] border-slate-800/50' : 'bg-gray-50 border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 52 52" fill="none">
                  <circle cx="28" cy="26" r="12" fill="white" />
                  <circle cx="32" cy="23" r="10" fill="url(#footerGrad)" />
                  <path d="M36 26l-2.12 6.53h-6.88l5.57-4.03-2.12-6.53 5.55 4.03z" fill="white" />
                  <defs><linearGradient id="footerGrad" x1="0" y1="0" x2="52" y2="52"><stop stopColor="#00a651" /><stop offset="1" stopColor="#008a44" /></linearGradient></defs>
                </svg>
              </div>
              <span className="text-white font-bold">{settings.siteName || 'PAK BOOSTER'}</span>
            </div>
            <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'} text-sm`}>
              {settings.siteTagline || 'Social Services'} — Pakistan's #1 SMM Panel
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 uppercase tracking-wider`}>Contact Us</h3>
            <div className="space-y-2">
              {settings.adminName && (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  👤 {settings.adminName}
                </p>
              )}
              {settings.adminPhone && (
                <a href={`tel:${settings.adminPhone}`} className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-gray-600 hover:text-emerald-600'} transition-colors`}>
                  <Phone className="w-4 h-4" />
                  {settings.adminPhone}
                </a>
              )}
              {settings.adminEmail && (
                <a href={`mailto:${settings.adminEmail}`} className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-gray-600 hover:text-emerald-600'} transition-colors`}>
                  <Mail className="w-4 h-4" />
                  {settings.adminEmail}
                </a>
              )}
              {settings.adminWhatsapp && (
                <a href={`https://wa.me/${settings.adminWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400 hover:text-green-400' : 'text-gray-600 hover:text-green-600'} transition-colors`}>
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp: {settings.adminWhatsapp}
                </a>
              )}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 uppercase tracking-wider`}>Follow Us</h3>
            {socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'} flex items-center justify-center transition-all ${link.color}`}
                    title={link.label}
                  >
                    <link.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>No social links yet</p>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className={`mt-8 pt-6 border-t ${isDark ? 'border-slate-800/50' : 'border-gray-200'} text-center`}>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            © {new Date().getFullYear()} {settings.siteName || 'PAK BOOSTER'} — All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  )
}
