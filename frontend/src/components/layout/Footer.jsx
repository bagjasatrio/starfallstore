import React from 'react'
import { Link } from 'react-router-dom'
import { Globe, MessageSquare } from 'lucide-react'

function StarfallLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sfgrad_footer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <path d="M50 10L55 35H80L60 50L68 75L50 60L32 75L40 50L20 35H45L50 10Z" fill="url(#sfgrad_footer)" />
      <path d="M20 80C40 80 60 60 80 40" stroke="url(#sfgrad_footer)" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <circle cx="85" cy="35" r="3" fill="#06B6D4" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-20">
      <div className="container-sf py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* ── Brand ──────────────────────────────────────────────── */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <StarfallLogo size={28} />
              <span className="font-display font-bold text-lg gradient-text">StarfallStore</span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              Premium Gaming Digital Marketplace. Elevate your gameplay with secure and instant transactions.
            </p>
          </div>

          {/* ── Navigasi ───────────────────────────────────────────── */}
          <div>
            <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider mb-4">Navigasi</h4>
            <ul className="space-y-3">
              {[
                { to: '/topup', label: 'Top Up Game' },
                { to: '/cek-transaksi', label: 'Cek Transaksi' },
                { to: '/leaderboard', label: 'Leaderboard' },
                { to: '/layanan-digital', label: 'Layanan Digital' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-text-muted hover:text-cyan-glow transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal ──────────────────────────────────────────────── */}
          <div>
            <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3">
              {[
                { to: '/syarat-ketentuan', label: 'Syarat & Ketentuan' },
                { to: '/kebijakan-privasi', label: 'Kebijakan Privasi' },
                { to: '/tentang-kami', label: 'Tentang Kami' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-text-muted hover:text-cyan-glow transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Bantuan / Sosial ───────────────────────────────────── */}
          <div>
            <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider mb-4">Bantuan</h4>
            <ul className="space-y-3 mb-6">
              {[
                { to: '/dukungan', label: 'Hubungi Kami' },
                { to: '/metode-pembayaran', label: 'Metode Pembayaran' },
                { to: '/faq', label: 'FAQ' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-text-muted hover:text-cyan-glow transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <a href="#" className="p-2.5 rounded-xl glass border border-white/10 hover:border-electric-blue/30 hover:bg-electric-blue/10 transition-all">
                <Globe size={16} className="text-text-muted" />
              </a>
              <a href="#" className="p-2.5 rounded-xl glass border border-white/10 hover:border-cyan-glow/30 hover:bg-cyan-glow/10 transition-all">
                <MessageSquare size={16} className="text-text-muted" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ─────────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} StarfallStore. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2">
            {['QRIS', 'VA', 'OVO', 'Dana', 'GoPay', 'ShopeePay'].map((method) => (
              <span key={method} className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-high/80 text-text-muted border border-outline/30">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
