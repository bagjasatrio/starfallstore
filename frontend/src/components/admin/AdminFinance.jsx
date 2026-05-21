import React, { useEffect, useState } from 'react'
import { adminApi } from '../../services/api'
import { TrendingUp, DollarSign, Wallet, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

function formatRp(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(n) || 0)
}

function StatCard({ label, value, icon: Icon, glowColor, trend }) {
  return (
    <div className={`glass-card p-6 relative overflow-hidden group hover:border-${glowColor}/30 transition-all`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${glowColor}/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-${glowColor}/10 transition-colors`} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-display text-text-muted uppercase tracking-wider font-semibold mb-2">{label}</p>
          <h3 className={`text-2xl md:text-3xl font-display font-bold text-text-primary`}>
            {value}
          </h3>
          {trend && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${trend.positive ? 'text-emerald-400' : 'text-text-muted'}`}>
              <TrendingUp size={12} className={trend.positive ? 'text-emerald-400' : ''} /> 
              {trend.text}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-${glowColor}/10 flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-${glowColor}),0.2)]`}>
          <Icon size={24} className={`text-${glowColor}`} />
        </div>
      </div>
    </div>
  )
}

export default function AdminFinance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminApi.finance()
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="text-electric-blue animate-spin" />
      </div>
    )
  }

  if (!data) return null

  // Calculate max values for chart scaling
  const maxRevenue = Math.max(...data.daily_trends.map(d => d.revenue), 1)
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Financial Analytics</h1>
          <p className="text-sm text-text-secondary mt-1">Real-time profit tracking & omzet analysis</p>
        </div>
        <button onClick={fetchData} className="btn-ghost text-xs">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Pendapatan Kotor" 
          value={formatRp(data.total_revenue)} 
          icon={Wallet} 
          glowColor="electric-blue" 
        />
        <StatCard 
          label="Total Modal Vendor" 
          value={formatRp(data.total_cost)} 
          icon={DollarSign} 
          glowColor="slate-400" 
        />
        <StatCard 
          label="Laba Bersih (Net Profit)" 
          value={formatRp(data.net_profit)} 
          icon={TrendingUp} 
          glowColor="emerald-400" 
          trend={{ positive: data.net_profit > 0, text: `Margin: ${data.profit_margin}%` }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* ── Dynamic Profit Chart (Tailwind CSS) ────────────────────────── */}
        <div className="xl:col-span-2 glass-card p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display font-semibold text-text-primary text-lg">Performa 30 Hari Terakhir</h3>
              <p className="text-xs text-text-muted mt-1">Perbandingan Revenue vs Net Profit</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-electric-blue" /> Revenue</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Net Profit</span>
            </div>
          </div>

          <div className="flex-1 flex items-end gap-1.5 md:gap-3 h-48 relative border-b border-white/10 pb-2">
            {data.daily_trends.map((day, i) => {
              const revHeight = (day.revenue / maxRevenue) * 100
              const profHeight = maxRevenue > 0 ? (day.net_profit / maxRevenue) * 100 : 0
              
              // Only show date labels for a few items to avoid crowding
              const showLabel = i % Math.ceil(data.daily_trends.length / 7) === 0 || i === data.daily_trends.length - 1
              const dateObj = new Date(day.date)
              const dateStr = `${dateObj.getDate()}/${dateObj.getMonth()+1}`

              return (
                <div key={day.date} className="flex-1 flex items-end justify-center group relative h-full">
                  {/* Revenue Bar */}
                  <div className="w-full max-w-[12px] md:max-w-[16px] bg-electric-blue/40 hover:bg-electric-blue/60 rounded-t-sm transition-all relative flex items-end" style={{ height: `${revHeight}%` }}>
                    {/* Profit Bar (Layered on top of revenue or beside it, we'll nest it inside to overlay at the bottom) */}
                    <div className="w-full bg-emerald-500 rounded-t-sm transition-all" style={{ height: `${(profHeight / (revHeight || 1)) * 100}%` }} />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-800 text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl border border-white/10 pointer-events-none flex flex-col gap-1">
                    <span className="text-text-muted">{day.date}</span>
                    <span className="text-electric-blue font-bold">Rev: {formatRp(day.revenue)}</span>
                    <span className="text-emerald-400 font-bold">Prof: {formatRp(day.net_profit)}</span>
                  </div>

                  {showLabel && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-text-muted whitespace-nowrap">
                      {dateStr}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Item-by-Item Profit Log ────────────────────────────────────── */}
        <div className="glass-card p-6 flex flex-col h-[400px]">
          <h3 className="font-display font-semibold text-text-primary text-lg mb-4">Log Profit Terkini</h3>
          
          <div className="flex-1 overflow-y-auto scrollbar-none pr-2 space-y-3">
            {data.recent_profits.map((log) => (
              <div key={log.invoice_id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] text-text-muted font-mono">{log.invoice_id.split('-')[0].toUpperCase()}</span>
                    <h4 className="text-sm font-semibold text-text-primary leading-tight mt-0.5">{log.product}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">{log.package}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 block bg-emerald-400/10 px-2 py-0.5 rounded">
                      +{formatRp(log.profit)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-muted pt-2 border-t border-white/5">
                  <span>Jual: {formatRp(log.revenue)}</span>
                  <span>Modal: {formatRp(log.cost)}</span>
                </div>
              </div>
            ))}
            
            {data.recent_profits.length === 0 && (
              <div className="text-center py-8 text-text-muted text-sm">
                Belum ada transaksi completed.
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  )
}
