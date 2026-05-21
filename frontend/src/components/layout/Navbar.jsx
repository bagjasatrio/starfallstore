import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap, ChevronDown, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import useAuthStore from '../../stores/authStore'
import LoginModal from '../auth/LoginModal'
import RegisterModal from '../auth/RegisterModal'

// ── StarfallStore SVG Logo ─────────────────────────────────────────────────────
function StarfallLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="starfall_grad_nav" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <filter id="glow_nav">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path d="M50 10L55 35H80L60 50L68 75L50 60L32 75L40 50L20 35H45L50 10Z"
        fill="url(#starfall_grad_nav)" filter="url(#glow_nav)" />
      <path d="M20 80C40 80 60 60 80 40" stroke="url(#starfall_grad_nav)"
        strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <circle cx="85" cy="35" r="3" fill="#06B6D4" />
    </svg>
  )
}

const navLinks = [
  { to: '/topup', label: 'Top Up' },
  { to: '/cek-transaksi', label: 'Cek Transaksi' },
  { to: '/leaderboard', label: 'Leaderboard' },
]

export default function Navbar() {
  const location = useLocation()
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close dropdowns on route change
  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [location])

  const switchToRegister = () => { setLoginOpen(false); setTimeout(() => setRegisterOpen(true), 150) }
  const switchToLogin = () => { setRegisterOpen(false); setTimeout(() => setLoginOpen(true), 150) }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-white/[0.06] shadow-xl shadow-black/20'
          : 'bg-transparent'
      }`}>
        <div className="container-sf">
          <div className="flex items-center justify-between h-16">

            {/* ── Brand ──────────────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <StarfallLogo size={30} />
              <span className="font-display font-bold text-lg gradient-text tracking-tight">
                StarfallStore
              </span>
            </Link>

            {/* ── Desktop Nav Links ──────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to || location.pathname.startsWith(link.to + '/')
                      ? 'text-electric-blue bg-electric-blue/10 border-b-2 border-electric-blue'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Auth Buttons / Profile ─────────────────────────────── */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl glass border border-white/10 hover:border-electric-blue/30 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-electric-blue to-cyan-glow flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-text-primary">{user?.name}</span>
                    <ChevronDown size={14} className={`text-text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 glass-modal border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-scale-in">
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                        <p className="text-xs text-text-muted">@{user?.username}</p>
                      </div>
                      <div className="p-1.5">
                        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                          <LayoutDashboard size={15} /> Dashboard
                        </Link>
                        {isAdmin() && (
                          <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cyan-glow hover:bg-cyan-glow/10 transition-colors">
                            <Shield size={15} /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => { logout(); setProfileOpen(false) }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-error hover:bg-error/10 transition-colors"
                        >
                          <LogOut size={15} /> Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={() => setLoginOpen(true)} className="btn-ghost text-sm">
                    Masuk
                  </button>
                  <button onClick={() => setRegisterOpen(true)} className="btn-primary text-sm py-2 px-5">
                    <Zap size={14} />
                    Daftar
                  </button>
                </>
              )}
            </div>

            {/* ── Mobile Hamburger ──────────────────────────────────── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {mobileOpen ? <X size={20} className="text-text-primary" /> : <Menu size={20} className="text-text-primary" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden glass border-t border-white/[0.06] animate-fade-in">
            <div className="container-sf py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-electric-blue bg-electric-blue/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="block px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5">
                      Dashboard
                    </Link>
                    <button onClick={logout} className="w-full text-left px-4 py-3 rounded-xl text-sm text-error hover:bg-error/10">
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setMobileOpen(false); setLoginOpen(true) }} className="btn-ghost w-full">Masuk</button>
                    <button onClick={() => { setMobileOpen(false); setRegisterOpen(true) }} className="btn-primary w-full">Daftar</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* ── Auth Modals ─────────────────────────────────────────────── */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  )
}
