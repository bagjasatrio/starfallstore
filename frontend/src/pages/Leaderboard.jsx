import React, { useEffect, useState } from 'react'
import { Trophy, Medal, Crown, Loader2 } from 'lucide-react'
import { leaderboardApi } from '../services/api'

function formatRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(n) || 0) }

const MEDALS = [
  { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/30' },
  { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30' },
]

function RankCard({ entry }) {
  const isTop3 = entry.rank <= 3
  const medal = isTop3 ? MEDALS[entry.rank - 1] : null
  const MedalIcon = medal?.icon || null

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
      isTop3
        ? `glass border ${medal.border} ${entry.rank === 1 ? 'bg-yellow-400/5' : ''}`
        : 'glass-card'
    }`}>
      {/* Rank */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        isTop3 ? `${medal.bg} border ${medal.border}` : 'bg-white/5 border border-white/10'
      }`}>
        {isTop3
          ? <MedalIcon size={20} className={medal.color} />
          : <span className="font-display font-bold text-sm text-text-muted">#{entry.rank}</span>
        }
      </div>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric-blue to-cyan-glow flex items-center justify-center text-sm font-bold text-white shrink-0">
        {entry.name?.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-text-primary text-sm truncate">{entry.name}</p>
        <p className="text-xs text-text-muted">@{entry.username} · {entry.transaction_count} transaksi</p>
      </div>

      {/* Total */}
      <div className="text-right">
        <p className={`font-display font-bold text-sm ${isTop3 ? medal.color : 'text-text-primary'}`}>
          {formatRp(entry.total_spending)}
        </p>
      </div>
    </div>
  )
}

function PeriodColumn({ title, data, loading }) {
  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Trophy size={16} className="text-electric-blue" /> {title}
      </h3>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : data?.length ? (
        <div className="space-y-2">
          {data.map((entry) => <RankCard key={entry.rank} entry={entry} />)}
        </div>
      ) : (
        <div className="text-center py-10 text-text-muted text-sm">
          <Trophy size={32} className="mx-auto mb-3 opacity-20" />
          Belum ada data
        </div>
      )}
    </div>
  )
}

export default function Leaderboard() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Leaderboard | StarfallStore'
    leaderboardApi.index()
      .then(res => setData(res.data.leaderboard || {}))
      .catch(() => setData(DEMO_DATA))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-sf py-8">
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric-blue/10 border border-electric-blue/20 mb-4">
          <Trophy size={14} className="text-electric-blue" />
          <span className="text-xs font-display font-semibold text-electric-blue uppercase tracking-wider">Top Buyers</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Leaderboard</h1>
        <p className="text-text-muted">Ranking berdasarkan total pengeluaran (Rp)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PeriodColumn title="Hari Ini" data={data.today} loading={loading} />
        <PeriodColumn title="Minggu Ini" data={data.this_week} loading={loading} />
        <PeriodColumn title="Bulan Ini" data={data.this_month} loading={loading} />
      </div>
    </div>
  )
}

const DEMO_DATA = {
  today: [
    { rank: 1, name: 'StarGamer99', username: 'stargamer99', total_spending: 2500000, transaction_count: 12 },
    { rank: 2, name: 'ProPlayer ID', username: 'proplayer_id', total_spending: 1800000, transaction_count: 8 },
    { rank: 3, name: 'GameKing2024', username: 'gameking2024', total_spending: 950000, transaction_count: 5 },
    { rank: 4, name: 'NightHunter', username: 'nighthunter', total_spending: 650000, transaction_count: 4 },
    { rank: 5, name: 'CyberRanger', username: 'cyberranger', total_spending: 500000, transaction_count: 3 },
  ],
  this_week: [
    { rank: 1, name: 'MegaSpender', username: 'megaspender', total_spending: 15000000, transaction_count: 67 },
    { rank: 2, name: 'StarGamer99', username: 'stargamer99', total_spending: 12500000, transaction_count: 54 },
    { rank: 3, name: 'RichBuyer', username: 'richbuyer', total_spending: 9000000, transaction_count: 40 },
  ],
  this_month: [
    { rank: 1, name: 'TopContributor', username: 'topcontributor', total_spending: 85000000, transaction_count: 380 },
    { rank: 2, name: 'MegaSpender', username: 'megaspender', total_spending: 62000000, transaction_count: 280 },
    { rank: 3, name: 'DiamondUser', username: 'diamonduser', total_spending: 45000000, transaction_count: 200 },
  ],
}
