import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle2, RefreshCw, AlertCircle, Package, Wallet, ChevronRight, Loader2 } from 'lucide-react'
import useAuthStore from '../stores/authStore'
import { orderApi } from '../services/api'

function formatRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(n) || 0) }

const STATUS_CFG = {
  unpaid:     { label: 'Menunggu Bayar', cls: 'badge-unpaid',     Icon: Clock },
  paid:       { label: 'Dibayar',        cls: 'badge-paid',       Icon: CheckCircle2 },
  processing: { label: 'Diproses',       cls: 'badge-processing', Icon: RefreshCw },
  completed:  { label: 'Sukses',         cls: 'badge-completed',  Icon: CheckCircle2 },
  failed:     { label: 'Gagal',          cls: 'badge-failed',     Icon: AlertCircle },
  expired:    { label: 'Kedaluwarsa',    cls: 'badge-expired',    Icon: AlertCircle },
}

export default function BuyerDashboard() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Dashboard | StarfallStore'
    orderApi.myOrders().then(res => setOrders(res.data.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-sf py-8 min-h-screen">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="glass-card p-6 md:col-span-1">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-blue to-cyan-glow flex items-center justify-center text-2xl font-bold text-white mb-4">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-display font-bold text-text-primary">{user?.name}</h2>
          <p className="text-sm text-text-muted">@{user?.username}</p>
          <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
          <div className="mt-4 p-3 rounded-xl bg-electric-blue/10 border border-electric-blue/20">
            <p className="text-xs text-text-muted">Saldo Wallet</p>
            <p className="font-display font-bold text-electric-blue text-lg">{formatRp(user?.wallet_balance || 0)}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Total Transaksi', value: orders.length, icon: Package, color: 'text-electric-blue' },
            { label: 'Sukses', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle2, color: 'text-success' },
            { label: 'Total Pengeluaran', value: formatRp(orders.filter(o => o.status === 'completed').reduce((s, o) => s + Number(o.total_amount), 0)), icon: Wallet, color: 'text-cyan-glow' },
            { label: 'Menunggu', value: orders.filter(o => ['unpaid', 'paid', 'processing'].includes(o.status)).length, icon: Clock, color: 'text-warning' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-5">
              <Icon size={20} className={`${color} mb-3`} />
              <p className="text-xs text-text-muted">{label}</p>
              <p className={`font-display font-bold text-lg mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order History */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-text-primary">Riwayat Pesanan</h3>
          <Link to="/cek-transaksi" className="text-xs text-electric-blue hover:text-cyan-glow transition-colors">Lihat Semua</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Package size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Belum ada transaksi.</p>
            <Link to="/topup" className="btn-primary mt-4 inline-flex text-sm">Mulai Top Up</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const cfg = STATUS_CFG[o.status] || STATUS_CFG.unpaid
              const StatusIcon = cfg.Icon
              return (
                <Link key={o.uuid} to={`/invoice/${o.uuid}`}
                  className="flex items-center justify-between p-4 rounded-xl glass border border-white/[0.06] hover:border-electric-blue/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center">
                      <Package size={18} className="text-electric-blue" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm text-text-primary">{o.product?.name}</p>
                      <p className="text-xs text-text-muted">{o.package?.name} · {formatRp(o.total_amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${cfg.cls}`}><StatusIcon size={10} /> {cfg.label}</span>
                    <ChevronRight size={16} className="text-text-muted group-hover:text-electric-blue group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
