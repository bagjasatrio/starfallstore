import React, { useState, useEffect } from 'react'
import { X, User, Lock, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react'
import { authApi } from '../../services/api'
import useAuthStore from '../../stores/authStore'
import toast from 'react-hot-toast'

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setForm({ username: '', password: '' })
      setErrors({})
    }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const res = await authApi.login(form)
      setAuth(res.data.user, res.data.token)
      toast.success(`Selamat datang kembali, ${res.data.user.name}! 🚀`)
      onClose()
    } catch (err) {
      const fieldErrors = err.response?.data?.errors || {}
      const general = err.response?.data?.message || 'Login gagal.'
      setErrors({ general, ...fieldErrors })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-modal w-full max-w-md animate-scale-in shadow-2xl shadow-black/60 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-text-primary">Masuk</h2>
                <p className="text-sm text-text-muted mt-1">Kembali bertransaksi di StarfallStore.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 px-4 py-3 mb-5 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                <AlertCircle size={15} className="shrink-0" /> {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username or Email */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Username atau Email</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="login-username"
                    type="text"
                    className="input-dark"
                    placeholder="Masukkan username atau email"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    autoComplete="username"
                    required
                  />
                </div>
                {errors.username && <p className="text-xs text-error mt-1.5">{errors.username[0]}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Kata Sandi</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    className="input-dark pr-12"
                    placeholder="Masukkan kata sandi"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-error mt-1.5">{errors.password[0]}</p>}
              </div>

              <button type="submit" disabled={loading} id="login-submit"
                className="btn-primary w-full py-3 mt-4 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><Zap size={16} /> Masuk ke Akun</span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              Belum punya akun?{' '}
              <button onClick={onSwitchToRegister} className="text-electric-blue hover:text-cyan-glow font-medium transition-colors">
                Daftar sekarang
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
