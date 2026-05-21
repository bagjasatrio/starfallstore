import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, Copy, CheckCircle2, Loader2, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Zap } from 'lucide-react'
import { orderApi } from '../services/api'

const STATUS_STEPS = [
  { key: 'unpaid',     label: 'Menunggu Pembayaran' },
  { key: 'paid',       label: 'Pembayaran Diterima' },
  { key: 'processing', label: 'Diproses Digiflazz' },
  { key: 'completed',  label: 'Selesai' },
]
const STEP_INDEX = { unpaid: 0, paid: 1, processing: 2, completed: 3, failed: -1, expired: -1 }

function formatRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(n) || 0) }

function Countdown({ expiresAt }) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const calc = () => Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
    setSecs(calc())
    const t = setInterval(() => setSecs(calc()), 1000)
    return () => clearInterval(t)
  }, [expiresAt])
  const m = Math.floor(secs / 60)
  const s = secs % 60
  const urgent = secs < 120
  return (
    <span className={`font-display font-bold text-xl tabular-nums ${urgent ? 'text-error animate-pulse' : 'text-warning'}`}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  )
}

function PaymentInstruction({ method }) {
  const [open, setOpen] = useState(false)
  const steps = {
    qris: ['Buka aplikasi e-wallet atau mobile banking', 'Pilih "Bayar" / "Scan QR"', 'Scan kode QRIS di atas', 'Konfirmasi pembayaran', 'Pesanan akan diproses otomatis'],
    va: ['Transfer ke nomor Virtual Account di atas', 'Pastikan nominal tepat hingga 3 digit terakhir', 'Pembayaran akan dikonfirmasi otomatis'],
    ovo: ['Buka aplikasi OVO', 'Pilih Transfer / Bayar', 'Masukkan kode QR atau nomor', 'Konfirmasi pembayaran'],
    dana: ['Buka aplikasi DANA', 'Scan QR atau masukkan nominal', 'Konfirmasi pembayaran'],
    gopay: ['Buka aplikasi Gojek', 'Pilih GoPay', 'Scan QR atau bayar via link', 'Konfirmasi'],
    shopeepay: ['Buka aplikasi Shopee', 'Pilih ShopeePay', 'Scan QR atau gunakan link', 'Konfirmasi'],
  }
  const methodSteps = steps[method] || steps.qris

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors">
        <span className="font-display font-semibold text-sm text-text-primary">
          📋 Cara Pembayaran {method?.toUpperCase()}
        </span>
        {open ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-2">
          {methodSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-text-secondary">
              <span className="w-5 h-5 rounded-full bg-electric-blue/20 text-electric-blue text-xs flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function InvoicePage() {
  const { uuid } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const pollRef = useRef(null)

  const fetchOrder = async () => {
    try {
      const res = await orderApi.show(uuid)
      setOrder(res.data.order)
      if (['completed', 'failed', 'expired', 'refunded'].includes(res.data.order.status)) {
        clearInterval(pollRef.current)
      }
    } catch {}
  }

  useEffect(() => {
    document.title = 'Invoice | StarfallStore'
    fetchOrder().finally(() => setLoading(false))
    pollRef.current = setInterval(fetchOrder, 10000)
    return () => clearInterval(pollRef.current)
  }, [uuid])

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="flex justify-center items-center py-24"><Loader2 size={36} className="text-electric-blue animate-spin" /></div>
  if (!order) return <div className="container-sf py-20 text-center text-text-muted">Pesanan tidak ditemukan.</div>

  const stepIdx = STEP_INDEX[order.status] ?? 0
  const isFailed = order.status === 'failed' || order.status === 'expired'

  return (
    <div className="container-sf py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Left: Payment Info ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Status Tracker */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-text-primary">Status Pesanan</h2>
              <button onClick={fetchOrder} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors">
                <RefreshCw size={15} />
              </button>
            </div>

            {isFailed ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/20">
                <AlertCircle size={20} className="text-error" />
                <div>
                  <p className="font-semibold text-error text-sm">
                    {order.status === 'expired' ? 'Pesanan Kedaluwarsa' : 'Pesanan Gagal'}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">Silakan buat pesanan baru.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {STATUS_STEPS.map((step, i) => {
                  const isActive = i === stepIdx
                  const isDone = i < stepIdx
                  return (
                    <div key={step.key} className={`flex items-center gap-4 p-3.5 rounded-xl transition-all ${
                      isActive ? 'bg-electric-blue/10 border border-electric-blue/20' :
                      isDone ? 'opacity-60' : 'opacity-30'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-success/20' :
                        isActive ? 'bg-electric-blue/20 animate-pulse-glow' : 'bg-white/5'
                      }`}>
                        {isDone ? <CheckCircle2 size={16} className="text-success" /> :
                         isActive ? <Loader2 size={16} className="text-electric-blue animate-spin" /> :
                         <span className="w-2 h-2 rounded-full bg-text-muted" />}
                      </div>
                      <span className={`font-display font-medium text-sm ${
                        isActive ? 'text-electric-blue' : isDone ? 'text-success' : 'text-text-muted'
                      }`}>{step.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Payment Display */}
          {order.status === 'unpaid' && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-text-primary">Detail Pembayaran</h3>
                {order.expires_at && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-text-muted" />
                    <Countdown expiresAt={order.expires_at} />
                  </div>
                )}
              </div>

              {order.payment_method === 'qris' && order.qris_url && (
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-2xl">
                    <img src={order.qris_url} alt="QRIS" className="w-44 h-44" />
                  </div>
                </div>
              )}

              {order.payment_method === 'va' && order.va_number && (
                <div className="bg-white/3 rounded-xl p-4 mb-4">
                  <p className="text-xs text-text-muted mb-1">Nomor Virtual Account</p>
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-xl text-text-primary tracking-widest">{order.va_number}</p>
                    <button onClick={() => copyText(order.va_number)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                      {copied ? <CheckCircle2 size={16} className="text-success" /> : <Copy size={16} className="text-text-muted" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-electric-blue/5 rounded-xl border border-electric-blue/20">
                <span className="text-sm text-text-secondary">Total Pembayaran</span>
                <span className="font-display font-bold text-lg text-electric-blue">{formatRp(order.total_amount)}</span>
              </div>

              <div className="mt-4">
                <PaymentInstruction method={order.payment_method} />
              </div>
            </div>
          )}

          {order.payment_url && order.status === 'unpaid' && (
            <a href={order.payment_url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full py-3.5 block text-center">
              <Zap size={16} className="inline mr-2" /> Bayar Sekarang
            </a>
          )}
        </div>

        {/* ── Right: Order Details ────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 sticky top-20">
            <h3 className="font-display font-semibold text-text-primary mb-5">Detail Pesanan</h3>
            <div className="space-y-3.5 text-sm">
              {[
                ['Invoice', <span className="font-mono text-xs">{uuid?.slice(0, 13).toUpperCase()}</span>],
                ['Produk', order.product?.name],
                ['Paket', order.package?.name],
                ['User ID', order.game_user_id],
                order.game_nickname ? ['Nickname', order.game_nickname] : null,
                ['Metode', order.payment_method?.toUpperCase()],
                ['Harga', formatRp(order.amount)],
                ['Biaya Admin', formatRp(order.admin_fee)],
                ['Total', <span className="text-cyan-glow font-bold">{formatRp(order.total_amount)}</span>],
                ['Dibuat', order.created_at ? new Date(order.created_at).toLocaleString('id-ID') : '-'],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} className="flex justify-between items-start gap-4">
                  <span className="text-text-muted shrink-0">{k}</span>
                  <span className="text-text-primary font-medium text-right">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <Link to="/cek-transaksi" className="btn-secondary w-full text-sm justify-center">
                Cek Transaksi Lain
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
