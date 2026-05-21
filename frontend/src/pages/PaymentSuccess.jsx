import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Copy, Home, FileText, Loader2 } from 'lucide-react'
import { orderApi } from '../services/api'

function formatRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(n) || 0) }

export default function PaymentSuccess() {
  const { uuid } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.title = 'Pembayaran Berhasil | StarfallStore'
    orderApi.show(uuid).then(res => setOrder(res.data.order)).catch(() => {}).finally(() => setLoading(false))
  }, [uuid])

  const copy = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={36} className="text-electric-blue animate-spin" /></div>

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 animate-fade-in-up">
      <div className="glass-modal p-8 text-center">
        {/* Success icon */}
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 rounded-full bg-success/20 border-2 border-success/30 flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-success" />
          </div>
          <div className="absolute inset-0 rounded-full bg-success/10 blur-xl" />
        </div>

        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Pembayaran Berhasil!</h1>
        <p className="text-text-muted text-sm mb-8 leading-relaxed">
          Transaksi Anda telah berhasil diproses dan item sedang dikirim.
        </p>

        {/* Invoice details */}
        <div className="glass border border-white/10 rounded-2xl p-5 text-left space-y-3.5 mb-7">
          {[
            ['Invoice ID', <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{`INV-${uuid?.slice(0,8).toUpperCase()}`}</span>
              <button onClick={() => copy(uuid)} className="text-text-muted hover:text-text-primary">
                {copied ? <CheckCircle2 size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </div>],
            order && ['Game', order.product?.name],
            order && ['Nickname', order.game_nickname],
            order && ['Metode Pembayaran', order.payment_method?.toUpperCase()],
            order && ['Total Pembayaran', <span className="text-cyan-glow font-bold text-base">{formatRp(order.total_amount)}</span>],
          ].filter(Boolean).map(([k, v]) => v && (
            <div key={k} className="flex justify-between items-center gap-4 text-sm">
              <span className="text-text-muted">{k}</span>
              <span className="text-text-primary font-medium text-right">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Link to={`/invoice/${uuid}`} className="btn-primary w-full py-3.5 justify-center">
            <FileText size={16} /> Cek Status Pesanan
          </Link>
          <Link to="/" className="btn-secondary w-full py-3.5 justify-center">
            <Home size={16} /> Kembali ke Beranda
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-text-muted mt-6 font-display gradient-text">StarfallStore</p>
    </div>
  )
}
