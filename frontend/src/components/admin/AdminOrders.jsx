import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ShoppingBag, Search, Eye, AlertCircle, RefreshCw, X, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'

function formatRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(n) || 0) }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: '', payment_method: '' })
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await adminApi.orders({ ...filters, page })
      setOrders(res.data.data)
      setMeta(res.data)
    } catch (err) {
      toast.error('Gagal memuat daftar pesanan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, filters.status, filters.payment_method])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchOrders()
  }

  const openDetail = async (uuid) => {
    setModalLoading(true)
    try {
      const res = await adminApi.orderShow(uuid)
      setSelectedOrder(res.data)
    } catch (err) {
      toast.error('Gagal memuat detail pesanan')
    } finally {
      setModalLoading(false)
    }
  }

  const handleRefund = async (uuid) => {
    if (!window.confirm('Apakah Anda yakin ingin melakukan refund untuk pesanan ini? Saldo pembeli akan dikembalikan dan stok akun (jika ada) akan dilepas kembali ke inventori.')) return
    try {
      const res = await adminApi.refund(uuid)
      toast.success(res.data.message)
      setSelectedOrder(res.data.order)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund gagal')
    }
  }

  const handleStatusChange = async (uuid, newStatus) => {
    if (!window.confirm(`Ubah status menjadi ${newStatus.toUpperCase()}?`)) return
    try {
      const res = await adminApi.orderStatus(uuid, newStatus)
      toast.success(res.data.message)
      setSelectedOrder(res.data.order)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-text-primary">Kelola Pesanan</h2>
          <p className="text-sm text-text-muted mt-1">Daftar transaksi, riwayat logs, dan refund pelanggan.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass p-5 rounded-2xl border border-white/5 mb-6 flex flex-wrap gap-4 items-end">
        <form onSubmit={handleSearch} className="flex-1 min-w-[240px]">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Cari Pesanan</label>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              className="input-dark pl-12 py-2.5 text-sm"
              placeholder="Cari UUID, HP, Email, atau Nickname..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </form>

        <div className="w-48">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Status</label>
          <select
            className="input-dark py-2.5 text-sm"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Semua Status</option>
            <option value="unpaid">Belum Bayar</option>
            <option value="paid">Dibayar</option>
            <option value="processing">Diproses</option>
            <option value="completed">Selesai</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Gagal</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="w-48">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Metode Bayar</label>
          <select
            className="input-dark py-2.5 text-sm"
            value={filters.payment_method}
            onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
          >
            <option value="">Semua Metode</option>
            <option value="qris">QRIS</option>
            <option value="va">Virtual Account</option>
            <option value="ewallet">E-Wallet</option>
            <option value="wallet">Wallet Balance</option>
          </select>
        </div>

        <button onClick={fetchOrders} className="btn-secondary py-2.5 px-4 text-sm flex items-center gap-2">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Orders Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            <div className="skeleton h-8 w-full rounded-lg" />
            <div className="skeleton h-8 w-full rounded-lg" />
            <div className="skeleton h-8 w-full rounded-lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
            <ShoppingBag size={32} className="text-white/20" />
            <p>Tidak ada transaksi yang cocok.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full p-5">
            {orders.map((o, i) => (
              <motion.div
                key={o.uuid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-cyan-glow/30 transition-all shadow-lg"
              >
                {/* Column 1: ID & Date */}
                <div className="flex-1 min-w-[120px]">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Order ID</p>
                  <p className="text-sm font-mono text-electric-blue">{o.uuid.substring(0, 8)}...</p>
                  <p className="text-xs text-text-muted mt-0.5">{new Date(o.created_at).toLocaleString('id-ID')}</p>
                </div>
                
                {/* Column 2: Product & Package */}
                <div className="flex-1 min-w-[150px]">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Produk</p>
                  <p className="text-sm font-semibold text-text-primary">{o.product?.name || 'N/A'}</p>
                  <p className="text-xs text-text-muted mt-0.5">{o.package?.name || 'N/A'}</p>
                </div>
                
                {/* Column 3: Buyer */}
                <div className="flex-1 min-w-[120px]">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Pembeli</p>
                  <p className="text-sm font-medium text-text-primary">{o.game_nickname || 'Guest'}</p>
                  <p className="text-xs text-text-muted mt-0.5">{o.buyer_phone}</p>
                </div>
                
                {/* Column 4: Financial Breakdown */}
                <div className="flex-2 min-w-[200px]">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Financial Breakdown</p>
                  <div className="text-xs space-y-0.5">
                    <div className="flex justify-between w-full max-w-[180px]">
                      <span className="text-text-muted">Harga Jual:</span>
                      <span className="text-text-primary font-medium">{formatRp(o.selling_price || (o.amount + (o.discount_amount||0)))}</span>
                    </div>
                    <div className="flex justify-between w-full max-w-[180px]">
                      <span className="text-text-muted">Modal:</span>
                      <span className="text-text-secondary">{formatRp(o.supplier_price || o.cost_price || 0)}</span>
                    </div>
                    {(o.discount_amount > 0) && (
                      <div className="flex justify-between w-full max-w-[180px]">
                        <span className="text-error">Diskon:</span>
                        <span className="text-error">-{formatRp(o.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between w-full max-w-[180px] pt-0.5 border-t border-white/10 mt-0.5">
                      <span className="text-emerald-400 font-medium">Profit:</span>
                      <span className="text-emerald-400 font-bold">{formatRp(o.net_profit || (o.amount - (o.cost_price||0)))}</span>
                    </div>
                  </div>
                </div>
                
                {/* Column 5: Status */}
                <div className="flex-1 min-w-[100px]">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Status</p>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${o.status === 'completed' ? 'bg-success/15 text-success border border-success/20' :
                      o.status === 'processing' ? 'bg-electric-blue/15 text-electric-blue border border-electric-blue/20' :
                        o.status === 'unpaid' ? 'bg-warning/15 text-warning border border-warning/20' :
                          o.status === 'refunded' ? 'bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/20' :
                            'bg-error/15 text-error border border-error/20'
                    }`}>
                    {o.status}
                  </span>
                </div>
                
                {/* Column 6: Actions */}
                <div className="flex shrink-0">
                  <button onClick={() => openDetail(o.uuid)} className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 h-fit shadow-md">
                    <Eye size={14} /> Detail
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">
              Previous
            </button>
            <span className="text-xs text-text-muted">Page {page} of {meta.last_page}</span>
            <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null) }}>
          <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700 shadow-2xl rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <div>
                <h3 className="text-lg font-display font-bold text-white">Detail Transaksi</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">{selectedOrder.uuid}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status Summary */}
                <div className="glass-card p-4 flex items-center justify-between border-white/10">
                  <div>
                    <p className="text-xs text-text-muted">Status</p>
                    <p className="text-sm font-bold uppercase tracking-wider text-text-primary mt-0.5">{selectedOrder.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="input-dark text-xs py-1.5 px-2 bg-black/40 border border-white/10 rounded-xl font-bold uppercase tracking-wider text-text-primary focus:ring-1 focus:ring-electric-blue"
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.uuid, e.target.value)}
                    >
                      <option value="unpaid">UNPAID</option>
                      <option value="paid">PAID</option>
                      <option value="processing">PROCESSING</option>
                      <option value="completed">COMPLETED</option>
                      <option value="failed">FAILED</option>
                      <option value="refunded">REFUNDED</option>
                      <option value="expired">EXPIRED</option>
                    </select>

                    {selectedOrder.status !== 'refunded' && selectedOrder.status !== 'expired' && selectedOrder.status !== 'failed' && (
                      <button onClick={() => handleRefund(selectedOrder.uuid)} className="px-3.5 py-1.5 bg-error/15 border border-error/20 text-error hover:bg-error/25 text-xs font-semibold rounded-xl transition-all">
                        Refund
                      </button>
                    )}
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Rincian Informasi</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-text-muted">Nama Game</span>
                      <span className="text-text-primary font-medium">{selectedOrder.product?.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-text-muted">Paket</span>
                      <span className="text-text-primary font-medium">{selectedOrder.package?.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-text-muted">Data Game ID</span>
                      <span className="text-text-primary font-semibold">{selectedOrder.game_user_id} {selectedOrder.game_server_id && `(${selectedOrder.game_server_id})`}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-text-muted">Nickname</span>
                      <span className="text-text-primary font-medium">{selectedOrder.game_nickname || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-text-muted">No. HP Pembeli</span>
                      <span className="text-text-primary">{selectedOrder.buyer_phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-text-muted">Email Pembeli</span>
                      <span className="text-text-primary">{selectedOrder.buyer_email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-text-muted">Pembayaran</span>
                      <span className="text-text-primary capitalize">{selectedOrder.payment_method} ({selectedOrder.payment_channel})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-text-muted">Total Pembayaran</span>
                      <span className="text-text-primary font-bold">{formatRp(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Credentials info if applicable */}
                {selectedOrder.account_stock && (
                  <div className="p-4 rounded-xl bg-electric-blue/10 border border-electric-blue/20">
                    <h5 className="text-xs font-bold text-electric-blue uppercase tracking-wider mb-2">Akun Digital Terkirim</h5>
                    <div className="space-y-1.5 text-xs font-mono text-text-primary">
                      {Object.entries(JSON.parse(selectedOrder.account_stock.credentials_encrypted || '{}')).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-text-muted uppercase">{k}:</span>
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Digiflazz Sync Info */}
                {(selectedOrder.digiflazz_ref_id || selectedOrder.digiflazz_sn) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">H2H Digiflazz</h4>
                    <div className="space-y-2 text-sm bg-white/[0.02] p-4 rounded-xl border border-white/5 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Ref ID:</span>
                        <span className="text-text-primary">{selectedOrder.digiflazz_ref_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">SN / Token:</span>
                        <span className="text-text-primary text-success font-semibold">{selectedOrder.digiflazz_sn || 'Belum keluar'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logs Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Transaction Logs</h4>
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/[0.06]">
                    {selectedOrder.logs?.map((l) => (
                      <div key={l.id} className="flex gap-4 relative">
                        <div className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 z-10">
                          <div className="w-2 h-2 rounded-full bg-electric-blue" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-text-primary">{l.event} <span className="text-[10px] text-text-muted uppercase px-1.5 py-0.5 rounded bg-white/5 ml-1">{l.source}</span></p>
                          <p className="text-[11px] text-text-muted mt-0.5">{l.message}</p>
                          <p className="text-[10px] text-text-muted mt-1">{new Date(l.created_at).toLocaleTimeString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-700/50 bg-slate-900/50">
              <button onClick={() => setSelectedOrder(null)} className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
