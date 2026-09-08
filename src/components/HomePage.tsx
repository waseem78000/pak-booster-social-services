import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Zap, ShoppingCart, Shield, Clock, CreditCard,
  Star, ChevronDown, ChevronUp, Eye, Users,
  TrendingUp, Globe, Headphones, ArrowRight, Check,
  User, Menu, X, Sun, Moon, Rocket
} from 'lucide-react'
import Logo from '@/components/Logo'
import { theme } from '@/lib/theme'

interface HomePageProps {
  onLogin: () => void
  onRegister: () => void
  isDark: boolean
  toggleTheme: () => void
}

const faqData = [
  { q: 'SMM Panel kya hai?', a: 'SMM Panel ek social media marketing service hai jo aapko Instagram, YouTube, TikTok, Facebook aur other platforms ke liye followers, likes, views aur subscribers provide karta hai affordable prices mein.' },
  { q: 'Kya main free mein try kar sakta hoon?', a: 'Nahi, hamare paid services hain lekin bahut affordable prices hain. Aap kam se kam Rs. 50 se order place kar sakte hain.' },
  { q: 'Orders kitni der mein start hote hain?', a: 'Zyada tar orders 1-24 hours mein start ho jate hain. Delivery speed service ke according different hoti hai.' },
  { q: 'Kya main wallet mein paisa add kar sakta hoon?', a: 'Haan! Aap JazzCash, EasyPaisa ya QR Code ke through wallet mein funds add kar sakte hain. Admin approve karega aur balance credit ho jayega.' },
  { q: 'Refund policy kya hai?', a: 'Agar order complete nahi hota ya cancel hota hai to aapko full refund milta hai wallet mein.' },
  { q: 'Kya mere data secure hain?', a: 'Haan, hum aapki privacy ko seriously lete hain. Saaara data encrypted hai aur secure servers pe stored hai.' },
]

const platforms = [
  { name: 'Instagram', color: 'from-pink-600 via-purple-600 to-orange-500', services: ['Followers', 'Likes', 'Views', 'Reels Views', 'Story Views'], count: '5+' },
  { name: 'YouTube', color: 'from-red-600 to-red-700', services: ['Subscribers', 'Views', 'Likes', 'Watch Time', 'Comments'], count: '5+' },
  { name: 'TikTok', color: 'from-cyan-400 via-pink-500 to-red-500', services: ['Followers', 'Likes', 'Views', 'Shares', 'Comments'], count: '5+' },
  { name: 'Facebook', color: 'from-blue-600 to-blue-700', services: ['Page Likes', 'Post Likes', 'Followers', 'Views', 'Shares'], count: '5+' },
  { name: 'Twitter / X', color: 'from-slate-700 to-black', services: ['Followers', 'Likes', 'Retweets', 'Views', 'Comments'], count: '5+' },
  { name: 'Telegram', color: 'from-blue-400 to-blue-600', services: ['Members', 'Views', 'Reactions', 'Votes', 'Post Reaches'], count: '5+' },
]

const PlatformIcon = ({ name, size = 28 }: { name: string; size?: number }) => {
  const s = size
  switch (name) {
    case 'Instagram':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig)" />
          <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="18" cy="6" r="1.5" fill="white" />
          <defs><linearGradient id="ig" x1="0" y1="24" x2="24" y2="0"><stop stopColor="#feda75" /><stop offset=".2" stopColor="#fa7e1e" /><stop offset=".4" stopColor="#d62976" /><stop offset=".6" stopColor="#962fbf" /><stop offset="1" stopColor="#4f5bd5" /></linearGradient></defs>
        </svg>
      )
    case 'YouTube':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="1" y="4" width="22" height="16" rx="4" fill="#FF0000" />
          <path d="M10 8.5l5 3.5-5 3.5V8.5z" fill="white" />
        </svg>
      )
    case 'TikTok':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" fill="white" />
        </svg>
      )
    case 'Facebook':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="#1877F2" />
          <path d="M16.67 15.47l.55-3.58h-3.44V8.66c0-.98.48-1.94 2.03-1.94h1.57V3.56s-1.42-.24-2.78-.24c-2.84 0-4.69 1.72-4.69 4.84v2.74H8.22v3.58h2.69V22h3.28v-6.53z" fill="white" />
        </svg>
      )
    case 'Twitter / X':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#000" />
          <path d="M13.32 10.58L18.85 4h-1.31l-4.8 5.58L8.77 4H4l5.8 8.42L4 20h1.31l5.07-5.89L15.23 20H20l-6.01-8.75L18.4 6h.01l-5.09 4.58z" fill="white" />
        </svg>
      )
    case 'Telegram':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="#0088CC" />
          <path d="M7.5 12.5l2 6 2-4 4-2-8-2z" fill="white" />
          <path d="M9.5 18.5l2-4 4-2" stroke="white" strokeWidth="0.5" fill="none" />
        </svg>
      )
    default:
      return <Globe className="text-white" style={{ width: s, height: s }} />
  }
}

const testimonials = [
  { name: 'Ahmed R.', role: 'YouTuber', text: 'Best SMM panel in Pakistan! My YouTube channel grew 10x in just 2 months. Bahut reliable service hai.', stars: 5 },
  { name: 'Fatima K.', role: 'Business Owner', text: 'Meri online shop ke liye Instagram followers bahut helpful rahe. Real quality followers milte hain.', stars: 5 },
  { name: 'Usman T.', role: 'Content Creator', text: 'Affordable prices aur fast delivery. Support team bhi bahut responsive hai. Highly recommended!', stars: 5 },
  { name: 'Sara M.', role: 'Digital Marketer', text: 'Maine bahut se panels try kiye but ye sabse best hai. Wallet system bahut convenient hai.', stars: 4 },
]

const stats = [
  { value: '50,000+', label: 'Happy Customers', icon: Users },
  { value: '10,00,000+', label: 'Orders Completed', icon: ShoppingCart },
  { value: '24/7', label: 'Support Available', icon: Headphones },
  { value: '99.9%', label: 'Uptime Guaranteed', icon: Shield },
]

export default function HomePage({ onLogin, onRegister, isDark, toggleTheme }: HomePageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const t = isDark ? theme.dark : theme.light

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-500`}>
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 ${t.bgNav} backdrop-blur-2xl border-b ${t.border} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo isDark={isDark} />
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className={`${t.textNav} hover:${t.text} text-sm transition-colors font-medium`}>Services</a>
              <a href="#features" className={`${t.textNav} hover:${t.text} text-sm transition-colors font-medium`}>Features</a>
              <a href="#faq" className={`${t.textNav} hover:${t.text} text-sm transition-colors font-medium`}>FAQ</a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={toggleTheme} className={`p-2.5 rounded-xl ${isDark ? 'bg-[#162032] text-yellow-400 hover:bg-[#1c2b4a]' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'} transition-all duration-300`}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Button variant="ghost" onClick={onLogin} className={`${t.textSub} hover:${t.text} font-medium`}>Sign In</Button>
              <Button onClick={onRegister} className={`bg-gradient-to-r ${t.gradient} hover:opacity-90 text-white font-semibold shadow-lg shadow-emerald-500/20`}>
                Get Started
              </Button>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={toggleTheme} className={`p-2 rounded-lg ${isDark ? 'bg-[#162032] text-yellow-400' : 'bg-emerald-50 text-emerald-600'} transition-all`}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button className={t.textSub} onClick={() => setMobileMenu(!mobileMenu)}>
                {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenu && (
          <div className={`md:hidden border-t ${t.border} ${t.bgNav} backdrop-blur-2xl`}>
            <div className="px-4 py-4 space-y-3">
              <a href="#services" className={`block ${t.textNav} hover:${t.text} py-2 font-medium`} onClick={() => setMobileMenu(false)}>Services</a>
              <a href="#features" className={`block ${t.textNav} hover:${t.text} py-2 font-medium`} onClick={() => setMobileMenu(false)}>Features</a>
              <a href="#faq" className={`block ${t.textNav} hover:${t.text} py-2 font-medium`} onClick={() => setMobileMenu(false)}>FAQ</a>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={onLogin} className={`flex-1 ${t.textSub} font-medium`}>Sign In</Button>
                <Button onClick={onRegister} className={`flex-1 bg-gradient-to-r ${t.gradient} text-white font-semibold`}>Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 ${t.heroGradient}`} />
        <div className={`absolute top-20 left-1/4 w-80 h-80 ${t.blob1} rounded-full blur-3xl`} />
        <div className={`absolute bottom-20 right-1/4 w-96 h-96 ${t.blob2} rounded-full blur-3xl`} />
        {/* Decorative grid pattern */}
        <div className={`absolute inset-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.04]'}`} style={{ backgroundImage: `radial-gradient(circle, ${isDark ? '#10b981' : '#059669'} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-36">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className={`${t.badge} mb-6 px-5 py-2 text-sm font-semibold border`}>
              <span className="mr-1.5">🇵🇰</span> #1 SMM Panel in Pakistan
            </Badge>
            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-extrabold ${t.text} leading-[1.1] mb-6 transition-colors duration-500`}>
              Grow Your{' '}
              <span className={`bg-gradient-to-r ${t.gradientText} bg-clip-text text-transparent`}>
                Social Media
              </span>
              {' '}Presence
            </h1>
            <p className={`text-lg md:text-xl ${t.textSub} max-w-2xl mx-auto mb-10 transition-colors duration-500 leading-relaxed`}>
              Premium quality followers, likes, views aur subscribers at the most affordable prices.
              Instant delivery, 24/7 support, and reliable service guaranteed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={onRegister} size="lg" className={`bg-gradient-to-r ${t.gradient} hover:opacity-90 text-white px-10 py-7 text-lg font-bold shadow-xl shadow-emerald-500/25 rounded-xl`}>
                <Rocket className="w-5 h-5 mr-2" /> Start Ordering
              </Button>
              <Button onClick={onLogin} size="lg" variant="outline" className={`${isDark ? 'border-[#1a2744] text-slate-300 hover:bg-[#111b2e] hover:text-white' : 'border-emerald-200 text-slate-600 hover:bg-emerald-50 hover:text-slate-900'} px-10 py-7 text-lg font-semibold rounded-xl`}>
                Sign In to Panel
              </Button>
            </div>
            <div className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-12 text-sm font-medium ${t.textMuted}`}>
              {['Instant Start', 'Real Quality', '24/7 Support', 'Lowest Prices'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={`border-y ${t.border} ${t.bgAlt} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <p className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${t.gradientText} bg-clip-text text-transparent`}>{s.value}</p>
                <p className={`${t.textSub} text-sm mt-1 font-medium transition-colors`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services by Platform */}
      <section id="services" className="py-20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className={`${t.badge} mb-4 font-semibold border`}>Our Services</Badge>
            <h2 className={`text-3xl md:text-4xl font-extrabold ${t.text} mb-4 transition-colors`}>Services for Every Platform</h2>
            <p className={`${t.textSub} max-w-2xl mx-auto transition-colors`}>Instagram, YouTube, TikTok, Facebook — sab platforms ke liye premium quality services available hain.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((p, i) => (
              <Card key={i} className={`${t.bgCard} ${t.border} ${t.borderHover} ${t.greenGlow} transition-all duration-300 group overflow-hidden rounded-2xl`}>
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${p.color} p-6 pb-5`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center backdrop-blur-sm shadow-lg">
                        <PlatformIcon name={p.name} size={32} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-xl">{p.name}</h3>
                        <p className="text-white/70 text-xs font-medium">{p.count} Services Available</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-5">
                      {p.services.map((s, j) => (
                        <span key={j} className={`${t.tag} ${t.tagText} text-xs px-3 py-1.5 rounded-full border ${t.tagBorder} font-medium transition-colors`}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <Button onClick={onLogin} className={`w-full bg-gradient-to-r ${t.gradient} hover:opacity-90 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/15`}>
                      Login to Order <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={`py-20 ${t.bgAlt} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className={`${t.badge} mb-4 font-semibold border`}>Why Choose Us</Badge>
            <h2 className={`text-3xl md:text-4xl font-extrabold ${t.text} mb-4 transition-colors`}>Why PAK BOOSTER?</h2>
            <p className={`${t.textSub} max-w-2xl mx-auto transition-colors`}>Humse aapko milega best quality service at unbeatable prices.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Instant Delivery', desc: 'Orders 1-24 hours mein start ho jate hain. Fastest delivery in Pakistan.', color: 'from-emerald-500 to-teal-500' },
              { icon: Shield, title: '100% Safe & Secure', desc: 'Aapka data aur payment bilkul secure hai. No password required.', color: 'from-green-500 to-emerald-600' },
              { icon: CreditCard, title: 'Easy Payments', desc: 'JazzCash, EasyPaisa, QR Code — jo method aapko pasand ho.', color: 'from-teal-500 to-cyan-500' },
              { icon: Star, title: 'Premium Quality', desc: 'Real, high-quality followers, likes, aur views. No bots, no fakes.', color: 'from-amber-500 to-orange-500' },
              { icon: Headphones, title: '24/7 Support', desc: 'Koi bhi issue ho, hamara support team hamesha ready hai.', color: 'from-emerald-500 to-green-500' },
              { icon: TrendingUp, title: 'Cheapest Prices', desc: 'Market se sasti prices. Bulk orders pe aur bhi discount milega.', color: 'from-cyan-500 to-teal-500' },
            ].map((f, i) => (
              <Card key={i} className={`${t.bgCard} ${t.border} ${t.borderHover} ${t.greenGlow} transition-all duration-300 group rounded-2xl`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/15`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`${t.text} font-bold text-lg mb-2 transition-colors`}>{f.title}</h3>
                  <p className={`${t.textSub} text-sm transition-colors leading-relaxed`}>{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className={`${t.badge} mb-4 font-semibold border`}>How It Works</Badge>
            <h2 className={`text-3xl md:text-4xl font-extrabold ${t.text} mb-4 transition-colors`}>3 Easy Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Free mein register karein aur apna account banayein.', icon: User },
              { step: '02', title: 'Add Funds', desc: 'JazzCash ya EasyPaisa se wallet mein paisa add karein.', icon: CreditCard },
              { step: '03', title: 'Place Order', desc: 'Service select karein, link dein, aur order place karein!', icon: ShoppingCart },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${t.gradient} flex items-center justify-center mx-auto mb-5 relative z-10 shadow-xl shadow-emerald-500/25`}>
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <p className={`font-bold text-sm mb-2 bg-gradient-to-r ${t.gradientText} bg-clip-text text-transparent`}>STEP {s.step}</p>
                <h3 className={`${t.text} font-bold text-xl mb-2 transition-colors`}>{s.title}</h3>
                <p className={`${t.textSub} text-sm transition-colors leading-relaxed`}>{s.desc}</p>
                {i < 2 && (
                  <div className={`hidden md:block absolute top-8 left-[60%] w-[80%] border-t border-dashed ${isDark ? 'border-[#1a2744]' : 'border-emerald-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-20 ${t.bgAlt} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className={`${t.badge} mb-4 font-semibold border`}>Testimonials</Badge>
            <h2 className={`text-3xl md:text-4xl font-extrabold ${t.text} mb-4 transition-colors`}>Customer Reviews</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((tt, i) => (
              <Card key={i} className={`${t.bgCard} ${t.border} ${t.greenGlow} rounded-2xl transition-colors duration-500`}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: tt.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className={`${t.textSub} text-sm mb-4 transition-colors leading-relaxed`}>"{tt.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                      {tt.name[0]}
                    </div>
                    <div>
                      <p className={`${t.text} text-sm font-semibold transition-colors`}>{tt.name}</p>
                      <p className={`${t.textMuted} text-xs transition-colors`}>{tt.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 transition-colors duration-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className={`${t.badge} mb-4 font-semibold border`}>FAQ</Badge>
            <h2 className={`text-3xl md:text-4xl font-extrabold ${t.text} mb-4 transition-colors`}>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqData.map((faq, i) => (
              <Card key={i} className={`${t.bgCard} ${t.border} rounded-2xl overflow-hidden transition-colors duration-500`}>
                <CardContent className="p-0">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className={`w-full flex items-center justify-between p-5 text-left ${isDark ? 'hover:bg-[#152238]/50' : 'hover:bg-emerald-50/50'} transition-colors`}>
                    <span className={`${t.text} font-semibold text-sm pr-4 transition-colors`}>{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${t.textMuted} flex-shrink-0 transition-colors`} />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className={`${t.textSub} text-sm transition-colors leading-relaxed`}>{faq.a}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative rounded-3xl overflow-hidden ${isDark ? 'shadow-[0_0_80px_rgba(16,185,129,0.15)]' : 'shadow-2xl shadow-emerald-200/50'}`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${t.ctaGradient}`} />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Grow?</h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">Abhi register karein aur apne social media ko next level pe le jayein!</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={onRegister} size="lg" className="bg-white text-emerald-700 hover:bg-white/90 px-8 py-6 text-lg font-bold rounded-xl shadow-xl">
                  Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button onClick={onLogin} size="lg" variant="ghost" className="text-white border-white/30 hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl">
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${t.border} ${t.bgAlt} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo isDark={isDark} />
              <p className={`${t.textSub} text-sm mt-3 transition-colors leading-relaxed`}>Pakistan's most trusted SMM panel. Quality services at affordable prices.</p>
            </div>
            <div>
              <h4 className={`${t.text} font-bold mb-4 transition-colors`}>Services</h4>
              <ul className={`space-y-2.5 text-sm ${t.textSub} transition-colors`}>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">Instagram Services</li>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">YouTube Services</li>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">TikTok Services</li>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">Facebook Services</li>
              </ul>
            </div>
            <div>
              <h4 className={`${t.text} font-bold mb-4 transition-colors`}>Company</h4>
              <ul className={`space-y-2.5 text-sm ${t.textSub} transition-colors`}>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">Terms of Service</li>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className={`${t.text} font-bold mb-4 transition-colors`}>Support</h4>
              <ul className={`space-y-2.5 text-sm ${t.textSub} transition-colors`}>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">FAQ</li>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">Contact Us</li>
                <li className="hover:text-emerald-500 transition-colors cursor-pointer">Live Chat</li>
              </ul>
            </div>
          </div>
          <div className={`border-t ${t.border} mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors`}>
            <p className={`${t.textMuted} text-sm transition-colors`}>© 2026 PAK BOOSTER SOCIAL SERVICES. All rights reserved.</p>
            <span className={`${t.textMuted} text-xs transition-colors`}>Made with ❤️ in Pakistan 🇵🇰</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
