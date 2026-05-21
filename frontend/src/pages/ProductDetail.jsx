import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, User, Hash, CreditCard, Zap, AlertCircle, ChevronRight } from 'lucide-react'
import { productApi, orderApi } from '../services/api'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  { id: 'qris',      label: 'QRIS',       icon: '⚡', desc: 'Scan & Pay',   fee: 'Fee: 0.7%', color: 'from-blue-600/20 to-blue-500/10' },
  { id: 'va',        label: 'Virtual Account', icon: '🏦', desc: 'BCA, BRI, Mandiri', fee: 'Fee: Rp 4.000', color: 'from-purple-600/20 to-purple-500/10' },
  { id: 'ovo',       label: 'OVO',        icon: '💜', desc: 'E-Wallet',     fee: 'Fee: 1%', color: 'from-violet-600/20 to-violet-500/10' },
  { id: 'dana',      label: 'DANA',       icon: '💙', desc: 'E-Wallet',     fee: 'Fee: 1%', color: 'from-blue-500/20 to-cyan-500/10' },
  { id: 'gopay',     label: 'GoPay',      icon: '💚', desc: 'E-Wallet',     fee: 'Fee: 1%', color: 'from-green-600/20 to-green-500/10' },
  { id: 'shopeepay', label: 'ShopeePay',  icon: '🧡', desc: 'E-Wallet',     fee: 'Fee: 1%', color: 'from-orange-600/20 to-orange-500/10' },
]

const VA_BANKS = ['BCA', 'BRI', 'Mandiri', 'BNI', 'Permata']

function formatRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(n) || 0) }

function calcFee(method, amount) {
  switch (method) {
    case 'qris': return Math.max(500, Math.round(amount * 0.007))
    case 'va': return 4000
    default: return Math.max(1000, Math.round(amount * 0.01))
  }
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  const [userId, setUserId] = useState('')
  const [serverId, setServerId] = useState('')
  const [nickname, setNickname] = useState(null)
  const [nickLoading, setNickLoading] = useState(false)
  const [nickError, setNickError] = useState('')

  const [selectedPkg, setSelectedPkg] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('qris')
  const [selectedBank, setSelectedBank] = useState('BCA')

  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    productApi.show(slug)
      .then(res => {
        setProduct(res.data.product)
        setPackages(res.data.packages || [])
        document.title = `${res.data.product.name} Top Up | StarfallStore`
      })
      .catch(() => navigate('/topup'))
      .finally(() => setLoading(false))
  }, [slug])

  const checkNickname = useCallback(async () => {
    if (!userId.trim() || !product) return
    setNickLoading(true)
    setNickname(null)
    setNickError('')
    try {
      const res = await orderApi.checkNickname({
        product_id: product.id,
        user_id: userId,
        server_id: serverId || null,
      })
      setNickname(res.data.nickname)
    } catch {
      setNickError('Nickname tidak ditemukan. Periksa ID Anda.')
    } finally {
      setNickLoading(false)
    }
  }, [userId, serverId, product])

  useEffect(() => {
    if (!userId) { setNickname(null); setNickError(''); return }
    const t = setTimeout(checkNickname, 1000)
    return () => clearTimeout(t)
  }, [userId, serverId])

  const adminFee = selectedPkg ? calcFee(selectedMethod, Number(selectedPkg.selling_price)) : 0
  const totalAmount = selectedPkg ? Number(selectedPkg.selling_price) + adminFee : 0

  const handleSubmit = async () => {
    if (!selectedPkg) return toast.error('Pilih paket terlebih dahulu.')
    if (!userId.trim()) return toast.error('Masukkan User ID.')
    if (product?.requires_server_id && !serverId.trim()) return toast.error('Masukkan Server ID.')

    setSubmitting(true)
    try {
      const res = await orderApi.create({
        product_id: product.id,
        package_id: selectedPkg.id,
        game_user_id: userId,
        game_server_id: serverId || null,
        game_nickname: nickname,
        payment_method: selectedMethod,
        payment_channel: selectedMethod === 'va' ? selectedBank : null,
        buyer_phone: phone || null,
        buyer_email: email || null,
      })
      toast.success('Pesanan berhasil dibuat!')
      navigate(`/invoice/${res.data.order.uuid}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan.')
    } finally {
      setSubmitting(false)
      setShowModal(false)
    }
  }

  if (loading) return (
    <div className="container-sf py-20 flex justify-center">
      <Loader2 size={36} className="text-electric-blue animate-spin" />
    </div>
  )

  if (!product) return null

  return (
    <div className="container-sf py-8">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-52 md:h-64">
        <img src={product.banner_url || `https://picsum.photos/seed/${product.id}/1200/400`}
          alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-navy/90 via-dark-navy/50 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">{product.name}</h1>
          <p className="text-text-muted text-sm mt-1">{product.publisher}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-2 space-y-6">

          {/* Game ID Input */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-text-primary mb-5 text-lg">Data Akun Game</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <User size={14} className="inline mr-1.5" />User ID / Player ID
                </label>
                <input type="text" className="input-dark" placeholder="Masukkan User ID"
                  value={userId} onChange={(e) => setUserId(e.target.value)} />
              </div>
              {product.requires_server_id && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Hash size={14} className="inline mr-1.5" />Server ID / Zone
                  </label>
                  <input type="text" className="input-dark" placeholder="Masukkan Server ID"
                    value={serverId} onChange={(e) => setServerId(e.target.value)} />
                </div>
              )}
              {/* Nickname checker */}
              {userId && (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm transition-all ${
                  nickLoading ? 'bg-electric-blue/10 border border-electric-blue/20' :
                  nickname ? 'bg-success/10 border border-success/20' :
                  nickError ? 'bg-error/10 border border-error/20' : ''
                }`}>
                  {nickLoading && <Loader2 size={15} className="text-electric-blue animate-spin" />}
                  {nickname && <CheckCircle2 size={15} className="text-success" />}
                  {nickError && !nickLoading && <AlertCircle size={15} className="text-error" />}
                  <span className={nickname ? 'text-success' : nickError ? 'text-error' : 'text-text-muted'}>
                    {nickLoading ? 'Memeriksa nickname...' : nickname || nickError}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Package Selection */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-text-primary mb-5 text-lg">Pilih Paket</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {packages.map((pkg) => (
                <button key={pkg.id} onClick={() => setSelectedPkg(pkg)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedPkg?.id === pkg.id
                      ? 'border-electric-blue bg-electric-blue/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                      : 'border-white/10 bg-white/3 hover:border-electric-blue/30 hover:bg-white/5'
                  }`}>
                  {pkg.is_popular && (
                    <span className="text-[10px] font-display font-bold text-cyan-glow uppercase tracking-wider">⭐ Popular</span>
                  )}
                  <p className="font-display font-bold text-text-primary mt-1">
                    {pkg.quantity} {pkg.currency_label || 'Item'}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{pkg.name}</p>
                  <p className="font-display font-semibold text-electric-blue text-sm mt-2">
                    {formatRp(pkg.selling_price)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-text-primary mb-5 text-lg">
              <CreditCard size={18} className="inline mr-2 text-electric-blue" />Metode Pembayaran
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {PAYMENT_METHODS.map((m) => (
                <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                  className={`p-4 rounded-xl border text-left transition-all bg-gradient-to-br ${m.color} ${
                    selectedMethod === m.id
                      ? 'border-electric-blue shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                      : 'border-white/10 hover:border-electric-blue/30'
                  }`}>
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <p className="font-display font-semibold text-text-primary text-sm">{m.label}</p>
                  <p className="text-xs text-text-muted">{m.fee}</p>
                </button>
              ))}
            </div>
            {selectedMethod === 'va' && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">Pilih Bank</label>
                <div className="flex flex-wrap gap-2">
                  {VA_BANKS.map(b => (
                    <button key={b} onClick={() => setSelectedBank(b)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        selectedBank === b ? 'border-electric-blue text-electric-blue bg-electric-blue/10' : 'border-white/10 text-text-secondary hover:border-white/20'
                      }`}>{b}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-20">
            <h3 className="font-display font-semibold text-text-primary mb-5">Ringkasan Pesanan</h3>
            {selectedPkg ? (
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Produk</span>
                  <span className="text-text-primary font-medium">{product.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Paket</span>
                  <span className="text-text-primary font-medium">{selectedPkg.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Harga</span>
                  <span className="text-text-primary">{formatRp(selectedPkg.selling_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Biaya Admin</span>
                  <span className="text-text-primary">{formatRp(adminFee)}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between font-display font-bold">
                  <span className="text-text-primary">Total</span>
                  <span className="text-cyan-glow text-lg">{formatRp(totalAmount)}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-text-muted text-sm mb-4">
                <Zap size={24} className="mx-auto mb-2 opacity-30" />
                Pilih paket untuk melihat ringkasan
              </div>
            )}

            {/* Contact fields for guest */}
            <div className="space-y-3 mb-5">
              <input type="tel" className="input-dark text-sm" placeholder="No. HP / WhatsApp (opsional)"
                value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input type="email" className="input-dark text-sm" placeholder="Email (opsional)"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <button
              onClick={() => setShowModal(true)}
              disabled={!selectedPkg || !userId.trim()}
              className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={16} /> Bayar Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Confirmation Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass-modal w-full max-w-sm animate-scale-in p-6">
              <h3 className="font-display font-bold text-lg text-text-primary mb-1">Konfirmasi Pesanan</h3>
              <p className="text-sm text-text-muted mb-5">Periksa detail sebelum melanjutkan pembayaran.</p>

              <div className="bg-white/3 rounded-xl p-4 space-y-2.5 mb-6">
                {[
                  ['Game', product.name],
                  ['User ID', userId],
                  nickname ? ['Nickname', nickname] : null,
                  ['Paket', selectedPkg?.name],
                  ['Metode', selectedMethod.toUpperCase()],
                  ['Total', formatRp(totalAmount)],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-text-muted">{k}</span>
                    <span className="text-text-primary font-medium">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <><Zap size={14} /> Bayar</>}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
