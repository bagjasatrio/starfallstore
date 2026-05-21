import React, { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Lock, Eye, EyeOff, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authApi } from '../../services/api'
import useAuthStore from '../../stores/authStore'
import toast from 'react-hot-toast'

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) { setForm({ name: '', username: '', email: '', phone: '', password: '', password_confirmation: '' }); setErrors({}) }
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
      const res = await authApi.register(form)
      setAuth(res.data.user, res.data.token)
      toast.success('Registrasi berhasil! Selamat datang di StarfallStore 🌟')
      onClose()
    } catch (err) {
      const fieldErrors = err.response?.data?.errors || {}
      const general = err.response?.data?.message || 'Registrasi gagal.'
      setErrors({ general, ...fieldErrors })
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Nama Lengkap', icon: User, type: 'text', placeholder: 'John Doe', autoComplete: 'name' },
    { key: 'username', label: 'Username', icon: User, type: 'text', placeholder: 'john_doe99', autoComplete: 'username' },
    { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'john@email.com', autoComplete: 'email' },
    { key: 'phone', label: 'No. HP / WhatsApp', icon: Phone, type: 'tel', placeholder: '08xxxxxxxxxx', autoComplete: 'tel' },
  ]

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-modal w-full max-w-md animate-scale-in shadow-2xl shadow-black/60 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-text-primary">Daftar</h2>
                <p className="text-sm text-text-muted mt-1">Buat akun StarfallStore Anda.</p>
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
              {fields.map(({ key, label, icon: Icon, type, placeholder, autoComplete }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      id={`reg-${key}`}
                      type={type}
                      className="input-dark"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      autoComplete={autoComplete}
                    />
                  </div>
                  {errors[key] && <p className="text-xs text-error mt-1.5">{errors[key][0]}</p>}
                </div>
              ))}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Kata Sandi</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    className="input-dark pr-12"
                    placeholder="Min. 8 karakter"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-error mt-1.5">{errors.password[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="reg-password-confirm"
                    type="password"
                    className="input-dark"
                    placeholder="Ulangi kata sandi"
                    value={form.password_confirmation}
                    onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                    autoComplete="new-password"
                  />
                  {form.password && form.password_confirmation && form.password === form.password_confirmation && (
                    <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-success" />
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} id="register-submit"
                className="btn-primary w-full py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mendaftar...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><Zap size={16} /> Buat Akun</span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              Sudah punya akun?{' '}
              <button onClick={onSwitchToLogin} className="text-electric-blue hover:text-cyan-glow font-medium transition-colors">
                Masuk sekarang
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
