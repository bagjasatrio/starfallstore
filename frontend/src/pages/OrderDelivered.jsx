import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Star, Loader2, Send, Home, FileSearch } from 'lucide-react'
import { orderApi } from '../services/api'

function formatRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(n) || 0) }

export default function OrderDelivered() {
  const { uuid } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [review, setReview] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    document.title = 'Produk Terkirim | StarfallStore'
    orderApi.show(uuid).then(res => setOrder(res.data.order)).catch(() => {}).finally(() => setLoading(false))
  }, [uuid])

  const handleReview = () => { if (rating) setSubmitted(true) }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={36} className="text-electric-blue animate-spin" /></div>

  return (
    <div className="container-sf py-8 max-w-2xl mx-auto">

      {/* Success Header */}
      <div className="glass-card p-8 text-center mb-5 animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-cyan-glow/20 border border-cyan-glow/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={34} className="text-cyan-glow" />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Produk Telah Terkirim!</h1>
        <p className="text-text-muted text-sm max-w-sm mx-auto">
          Pesanan Anda telah berhasil diproses dan dikirimkan ke akun tujuan. Terima kasih telah berbelanja di StarfallStore.
        </p>
      </div>

      {/* Item Delivered */}
      {order && (
        <div className="glass-card p-6 mb-5 animate-fade-in-up delay-100">
          <h2 className="font-display font-semibold text-text-primary mb-4">Item Terkirim</h2>
          <div className="flex items-center gap-4 bg-white/3 rounded-xl p-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-blue/20 to-cyan-glow/20 border border-white/10 flex items-center justify-center">
              <span className="text-xl">🎮</span>
            </div>
            <div>
              <p className="text-xs text-cyan-glow font-medium">{order.product?.name}</p>
              <p className="font-display font-bold text-text-primary">
                {order.package?.quantity} {order.package?.currency_label || order.package?.name}
              </p>
              {order.digiflazz_sn && (
                <p className="text-xs text-text-muted mt-0.5">SN: {order.digiflazz_sn}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail */}
      {order && (
        <div className="glass-card p-6 mb-5 animate-fade-in-up delay-200">
          <h2 className="font-display font-semibold text-text-primary mb-4">Detail Transaksi</h2>
          <div className="space-y-3 text-sm">
            {[
              ['Order ID', `#TRX-${uuid?.slice(0,8).toUpperCase()}`],
              ['Tanggal', order.completed_at ? new Date(order.completed_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) + ' WIB' : '-'],
              ['Metode Pembayaran', order.payment_method?.toUpperCase()],
              ['Total Pembayaran', <span className="text-cyan-glow font-bold">{formatRp(order.total_amount)}</span>],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center gap-4">
                <span className="text-text-muted">{k}</span>
                <span className="text-text-primary font-medium text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review */}
      <div className="glass-card p-6 mb-6 animate-fade-in-up delay-300">
        <h2 className="font-display font-semibold text-text-primary mb-1 text-center">Beri Ulasan</h2>
        <p className="text-text-muted text-xs text-center mb-4">Bagaimana pengalaman transaksi Anda?</p>
        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle2 size={28} className="text-success mx-auto mb-2" />
            <p className="text-success font-medium text-sm">Ulasan berhasil dikirim! Terima kasih.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}>
                  <Star size={28} className={`transition-colors ${
                    s <= (hover || rating) ? 'text-warning fill-warning' : 'text-text-muted'
                  }`} />
                </button>
              ))}
            </div>
            <textarea
              className="input-dark min-h-[100px] resize-none"
              placeholder="Tulis ulasan Anda di sini (opsional)..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <button onClick={handleReview} className="btn-primary w-full mt-3 py-3">
              <Send size={15} /> Kirim Ulasan
            </button>
          </>
        )}
      </div>

      <div className="flex gap-3 animate-fade-in-up delay-400">
        <Link to="/" className="btn-primary flex-1 py-3 justify-center"><Home size={15} /> Kembali ke Beranda</Link>
        <Link to="/cek-transaksi" className="btn-secondary flex-1 py-3 justify-center"><FileSearch size={15} /> Cek Transaksi Lainnya</Link>
      </div>
    </div>
  )
}
