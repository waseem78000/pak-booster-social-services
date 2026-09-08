import { Globe } from 'lucide-react'

const SITE_NAME = 'PAK BOOSTER'
const SITE_SUB = 'SOCIAL SERVICES'

export default function Logo({ isDark, size = 'default' }: { isDark: boolean; size?: 'default' | 'large' | 'sidebar' }) {
  const h = size === 'large' ? 48 : size === 'sidebar' ? 34 : 38
  const w = h
  const nameSize = size === 'large' ? 'text-2xl' : size === 'sidebar' ? 'text-[13px]' : 'text-lg'
  const subSize = size === 'large' ? 'text-[10px]' : 'text-[8px]'

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Pakistan Flag Inspired Logo */}
      <div className="relative flex-shrink-0">
        <svg width={w} height={h} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pkgGrad" x1="0" y1="0" x2="52" y2="52">
              <stop offset="0%" stopColor="#00a651" />
              <stop offset="100%" stopColor="#008a44" />
            </linearGradient>
            <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="#e8e8e8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Background rounded square */}
          <rect width="52" height="52" rx="14" fill="url(#pkgGrad)" />
          {/* Subtle pattern lines */}
          <rect x="0" y="0" width="52" height="52" rx="14" fill="white" opacity="0.03" />
          {/* Crescent */}
          <circle cx="28" cy="26" r="12" fill="url(#starGrad)" />
          <circle cx="32" cy="23" r="10" fill="url(#pkgGrad)" />
          {/* Star */}
          <g filter="url(#glow)">
            <path d="M36 26l-2.12 6.53h-6.88l5.57-4.03-2.12-6.53 5.55 4.03z" fill="white" />
          </g>
          {/* Bottom accent bar */}
          <rect x="4" y="46" width="44" height="2" rx="1" fill="white" opacity="0.25" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-extrabold ${nameSize} leading-tight tracking-tight ${isDark ? 'text-white' : 'text-[#0a1628]'}`}>
          {SITE_NAME}
        </span>
        <span className={`${subSize} font-semibold tracking-[0.2em] uppercase ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
          {SITE_SUB}
        </span>
      </div>
    </div>
  )
}
