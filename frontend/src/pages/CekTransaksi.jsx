import React, { useState } from 'react'
import { Search, Loader2, AlertCircle, CheckCircle2, Clock, RefreshCw, ChevronRight, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { orderApi } from '../services/api'

export default function CekTransaksi() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) {
      setError('Silakan masukkan Nomor Invoice.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const res = await orderApi.track(query.trim())
      setResult(res.data.order)
    } catch (err) {
      if (err.response?.status === 404) {
        setError(err.response.data?.message || 'Pesanan tidak ditemukan. Periksa kembali Nomor Invoice Anda.')
      } else {
        setError('Terjadi kesalahan pada server. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Helper for Status Badge
  const getStatusConfig = (status) => {
    switch(status) {
      case 'completed':
        return { label: 'SUKSES', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' }
      case 'failed':
      case 'expired':
      case 'refunded':
        return { label: 'GAGAL', className: 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]' }
      default: // unpaid, paid, processing
        return { label: 'DIPROSES', className: 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' }
    }
  }

  return (
    <div className="container-sf py-16 min-h-[80vh]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in-up">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-text-primary mb-4">
          Lacak <span className="gradient-text glow-text-cyan">Pesanan</span>
        </h1>
        <p className="text-text-secondary leading-relaxed max-w-lg mx-auto">
          Pantau status top-up Anda secara real-time. Masukkan Nomor Invoice yang Anda dapatkan saat checkout.
        </p>
      </div>

      {/* Search Container */}
      <div className="max-w-xl mx-auto mb-12 animate-fade-in-up delay-100">
        <form onSubmit={handleSearch} className="glass-card p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/5 to-cyan-glow/5 pointer-events-none" />
          <div className="flex flex-col md:flex-row gap-3 relative z-10">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-text-primary focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow transition-all outline-none font-medium"
                placeholder="INV-XXXXXXX"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary py-3.5 px-6 shrink-0 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Mencari...</>
              ) : (
                <><Search size={18} /> Cari Transaksi</>
              )}
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 px-5 py-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3 backdrop-blur-md"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tracking Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass-card overflow-hidden">
              {/* Order Summary Header */}
              <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-white/[0.02] to-transparent">
                <div>
                  <p className="text-sm text-text-muted mb-1 uppercase tracking-wider font-semibold">Nomor Invoice</p>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                    {result.uuid.toUpperCase()}
                  </h2>
                </div>
                
                {(() => {
                  const cfg = getStatusConfig(result.status)
                  return (
                    <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${cfg.className}`}>
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.className.includes('amber') ? 'bg-amber-400' : cfg.className.includes('emerald') ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.className.includes('amber') ? 'bg-amber-500' : cfg.className.includes('emerald') ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      </span>
                      <span className="font-display font-bold tracking-wider text-sm">{cfg.label}</span>
                    </div>
                  )
                })()}
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                
                {/* Details Grid */}
                <div>
                  <h3 className="font-display font-semibold text-lg text-text-primary mb-6 flex items-center gap-2">
                    <AlertCircle size={18} className="text-electric-blue" />
                    Detail Pembelian
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Game</p>
                      <p className="font-medium text-text-primary">{result.product?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Item / Paket</p>
                      <p className="font-medium text-text-primary">{result.package?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">User ID / Server</p>
                      <p className="font-medium text-text-primary">
                        {result.game_user_id} {result.game_server_id ? `(${result.game_server_id})` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Nickname</p>
                      <p className="font-medium text-text-primary">{result.game_nickname || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-text-muted mb-1">Metode Pembayaran</p>
                      <p className="font-medium text-text-primary uppercase">{result.payment_method}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Stepper */}
                <div className="relative">
                  <h3 className="font-display font-semibold text-lg text-text-primary mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-electric-blue" />
                    Status Perjalanan
                  </h3>
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    {(() => {
                      const s = result.status
                      const isPaid = !['unpaid'].includes(s)
                      const isProcessing = ['processing', 'completed'].includes(s)
                      const isDone = ['completed'].includes(s)
                      
                      const steps = [
                        { title: 'Pesanan Dibuat', desc: 'Menunggu pembayaran dari Anda', active: true, time: result.created_at },
                        { title: 'Pembayaran Diterima', desc: 'Sistem telah memverifikasi pembayaran', active: isPaid, time: result.paid_at },
                        { title: 'Proses Top-Up', desc: 'Sistem H2H sedang mengirim pesanan', active: isProcessing, time: null },
                        { title: 'Selesai / Masuk ke Akun', desc: 'Pesanan berhasil dikirim ke akun Anda', active: isDone, time: result.completed_at }
                      ]

                      return steps.map((step, idx) => (
                        <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${step.active ? 'opacity-100' : 'opacity-40'}`}>
                          
                          {/* Marker */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 
                            ${step.active ? 'bg-dark-navy border-electric-blue text-cyan-glow shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                          >
                            {step.active ? <Check size={16} className="animate-scale-in" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
                          </div>
                          
                          {/* Content */}
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-4 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-semibold text-sm ${step.active ? 'text-text-primary' : 'text-text-muted'}`}>{step.title}</h4>
                              {step.time && (
                                <span className="text-[10px] text-text-muted">
                                  {new Date(step.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted leading-relaxed">{step.desc}</p>
                          </div>

                        </div>
                      ))
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
