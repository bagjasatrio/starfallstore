import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { BarChart3, ShoppingBag, Package, Database, Users, Home, TrendingUp, RefreshCw, CheckCircle2, Clock, AlertCircle, ChevronRight, DollarSign } from 'lucide-react'
import { adminApi } from '../services/api'
import Navbar from '../components/layout/Navbar'
import AdminOrders from '../components/admin/AdminOrders'
import AdminProducts from '../components/admin/AdminProducts'
import AdminInventory from '../components/admin/AdminInventory'
import AdminUserManagement from '../components/admin/AdminUserManagement'
import AdminAuditLogs from '../components/admin/AdminAuditLogs'
import AdminFinance from '../components/admin/AdminFinance'
import AdminVouchers from '../components/admin/AdminVouchers'

function formatRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(n) || 0) }

const SIDEBAR_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { to: '/admin/orders', label: 'Pesanan', icon: ShoppingBag },
  { to: '/admin/products', label: 'Produk', icon: Package },
  { to: '/admin/inventory', label: 'Stok Akun', icon: Database },
  { to: '/admin/vouchers', label: 'Voucher', icon: Database }, // Reusing Database or Ticket icon if available, but let's stick to standard lucide icons
  { to: '/admin/users', label: 'Manajemen User', icon: Users },
  { to: '/admin/finance', label: 'Finance Analytics', icon: DollarSign },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: AlertCircle },
]

function AdminSidebar() {
  const { pathname } = useLocation()
  return (
    <aside className="w-60 shrink-0 glass border-r border-white/[0.06] min-h-screen pt-4">
      <div className="px-4 mb-6">
        <div className="px-3 py-2">
          <p className="text-xs font-display font-semibold text-text-muted uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>
      <nav className="px-3 space-y-1">
        {SIDEBAR_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = to === '/admin' ? pathname === '/admin' : pathname.startsWith(to)
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-electric-blue/10 text-electric-blue border border-electric-blue/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}>
              <Icon size={17} /> {label}
            </Link>
          )
        })}
        <div className="border-t border-white/[0.06] pt-2 mt-4">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5">
            <Home size={17} /> Kembali ke Toko
          </Link>
        </div>
      </nav>
    </aside>
  )
}

function DashboardHome() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.stats().then(res => setStats(res.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Revenue Hari Ini', value: formatRp(stats.revenue_today), icon: TrendingUp, color: 'text-cyan-glow', bg: 'bg-cyan-glow/10' },
    { label: 'Revenue Bulan Ini', value: formatRp(stats.revenue_month), icon: BarChart3, color: 'text-electric-blue', bg: 'bg-electric-blue/10' },
    { label: 'Order Hari Ini', value: stats.orders_today, icon: ShoppingBag, color: 'text-purple-accent', bg: 'bg-purple-accent/10' },
    { label: 'Order Pending', value: stats.orders_pending, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Total User', value: stats.total_users, icon: Users, color: 'text-success', bg: 'bg-success/10' },
  ] : []

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-6">Overview</h2>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {cards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card p-5">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-xs text-text-muted">{label}</p>
              <p className={`font-display font-bold text-lg mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart Mock (Revenue Trends) */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display font-semibold text-text-primary">Revenue Trends</h3>
              <p className="text-xs text-text-muted mt-1">Estimasi pendapatan kotor 7 hari terakhir</p>
            </div>
            <select className="input-dark text-xs py-1.5 px-3">
              <option>7 Hari</option>
              <option>30 Hari</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end gap-2 h-40">
            {/* Pure CSS Bar/Line Chart Mockup */}
            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                <div className="w-full bg-gradient-to-t from-electric-blue/50 to-cyan-glow/50 rounded-t-sm transition-all group-hover:opacity-80" style={{ height: `${h}%` }}></div>
                <span className="text-[10px] text-text-muted mt-2">D-{6-i}</span>
                <div className="absolute -top-8 bg-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl border border-white/10">
                  Val: {h}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Mock (Top Selling) */}
        <div className="glass-card p-6 flex flex-col min-h-[300px]">
          <h3 className="font-display font-semibold text-text-primary mb-1">Top Selling Games</h3>
          <p className="text-xs text-text-muted mb-6">Berdasarkan volume transaksi</p>

          <div className="space-y-4 flex-1">
            {[
              { name: 'Mobile Legends', val: 85, color: 'bg-cyan-glow' },
              { name: 'Free Fire', val: 65, color: 'bg-warning' },
              { name: 'Genshin Impact', val: 45, color: 'bg-purple-accent' },
              { name: 'Valorant', val: 30, color: 'bg-error' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">{item.name}</span>
                  <span className="font-mono text-text-primary">{item.val}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Lihat Pesanan', to: '/admin/orders', icon: ShoppingBag },
            { label: 'Tambah Produk', to: '/admin/products', icon: Package },
            { label: 'Kelola Voucher', to: '/admin/vouchers', icon: Database },
            { label: 'Audit Logs', to: '/admin/audit-logs', icon: AlertCircle },
            { label: 'Leaderboard', to: '/leaderboard', icon: TrendingUp },
          ].map(({ label, to, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-2.5 px-4 py-3 rounded-xl glass border border-white/10 hover:border-electric-blue/30 transition-all text-sm font-medium text-text-secondary hover:text-text-primary group">
              <Icon size={16} className="text-electric-blue" /> {label}
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="vouchers" element={<AdminVouchers />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
