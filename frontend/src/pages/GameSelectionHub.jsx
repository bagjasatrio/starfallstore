import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2, Smartphone, Monitor, Search, Filter, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { productApi } from '../services/api'

const MotionLink = motion.create(Link)

const FILTERS = ['All Games', 'Mobile', 'PC', 'Console']
const GENRE_COLORS = {
  MOBA: 'genre-moba', FPS: 'genre-fps', RPG: 'genre-rpg',
  'Battle Royale': 'genre-royale', Racing: 'genre-racing',
}

function formatRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n) }

function PopularCard({ product, rank }) {
  const price = product.packages?.[0]?.selling_price ?? product.starting_price ?? 1500
  const icons = { MOBA: '🛡️', FPS: '🎯', RPG: '⚔️', 'Battle Royale': '🪂', Racing: '🏎️' }
  return (
    <MotionLink 
      to={`/topup/${product.slug}`} 
      whileHover={{ scale: 1.03, boxShadow: "0px 0px 30px rgba(6, 182, 212, 0.25)" }}
      whileTap={{ scale: 0.97 }}
      className="glass-card overflow-hidden group block border border-white/5 transition-colors hover:border-cyan-glow/50"
    >
      <div className="relative overflow-hidden aspect-[16/9]">
        <motion.img 
          src={product.banner_url || `https://picsum.photos/seed/${product.id}/400/225`}
          alt={product.name} 
          className="w-full h-full object-cover" 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/90 via-dark-navy/30 to-transparent" />
        {product.genre && (
          <span className={`genre-tag absolute top-3 right-3 ${GENRE_COLORS[product.genre] || 'genre-moba'}`}>
            {product.genre}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-text-primary group-hover:text-electric-blue transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-text-muted">{product.publisher}</p>
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-xs text-text-muted">Starting from</p>
            <p className="font-display font-bold text-text-primary flex items-center gap-1.5 mt-0.5">
              <span className="text-cyan-glow text-xs">{icons[product.genre] || '⭐'}</span>
              {formatRp(price)}
            </p>
          </div>
          <div className="btn-primary text-xs py-2 px-4">Top Up</div>
        </div>
      </div>
    </MotionLink>
  )
}

function SmallCard({ product }) {
  const price = product.packages?.[0]?.selling_price ?? product.starting_price ?? 1500
  return (
    <MotionLink 
      to={`/topup/${product.slug}`} 
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
      }}
      whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.2)" }}
      whileTap={{ scale: 0.95 }}
      className="glass-card overflow-hidden group block border border-white/5 hover:border-blue-500/50"
    >
      <div className="relative overflow-hidden aspect-video">
        <motion.img 
          src={product.banner_url || `https://picsum.photos/seed/${product.id}/300/170`}
          alt={product.name} 
          className="w-full h-full object-cover" 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/80 via-dark-navy/10 to-transparent" />
      </div>
      <div className="p-4 relative z-10 -mt-2 bg-gradient-to-t from-dark-navy to-transparent">
        <h4 className="font-display font-semibold text-sm text-text-primary group-hover:text-blue-400 transition-colors truncate">{product.name}</h4>
        <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
          <Zap size={10} className="text-cyan-glow" />
          {formatRp(price)}
        </p>
      </div>
    </MotionLink>
  )
}

const DEMO_POPULAR = [
  { id: 1, name: 'Mobile Legends', slug: 'mobile-legends', genre: 'MOBA', publisher: 'Moonton', banner_url: null, starting_price: 1500 },
  { id: 2, name: 'PUBG Mobile', slug: 'pubg-mobile', genre: 'Battle Royale', publisher: 'Level Infinite', banner_url: null, starting_price: 14500 },
  { id: 3, name: 'Valorant', slug: 'valorant', genre: 'FPS', publisher: 'Riot Games', banner_url: null, starting_price: 15000 },
]
const DEMO_ALL = [
  { id: 4, name: 'Roblox', slug: 'roblox', genre: 'RPG', publisher: 'Roblox Corp', banner_url: null, starting_price: 10000 },
  { id: 5, name: 'MCGogo', slug: 'mcgogo', genre: 'Racing', publisher: 'Garena', banner_url: null, starting_price: 5000 },
  { id: 6, name: 'Delta Force', slug: 'delta-force', genre: 'FPS', publisher: 'TiMi Studio', banner_url: null, starting_price: 25000 },
  { id: 7, name: 'Free Fire', slug: 'free-fire', genre: 'Battle Royale', publisher: 'Garena', banner_url: null, starting_price: 1000 },
]

export default function GameSelectionHub() {
  const [activeFilter, setActiveFilter] = useState('All Games')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Top Up Games | StarfallStore'
    productApi.list({ category: 'game' })
      .then(res => setProducts(res.data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const popular = products.slice(0, 3).length ? products.slice(0, 3) : DEMO_POPULAR
  const allGames = products.length ? products : [...DEMO_POPULAR, ...DEMO_ALL]

  const filtered = allGames.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All Games' || (p.platforms && p.platforms.includes(activeFilter))
    return matchSearch && matchFilter
  })

  return (
    <div className="container-sf py-8 bg-grid min-h-screen">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-display font-bold text-text-primary">Explore Universe</h1>
        <p className="text-text-secondary mt-2 max-w-xl">
          Discover premium digital assets and top-up your favorite titles across all platforms. Secure, instant, and verified.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up delay-100">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            className="input-dark pl-11"
            placeholder="Cari game..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-4 py-2.5 rounded-full text-sm font-display font-semibold border transition-all ${
                activeFilter === f
                  ? 'bg-electric-blue text-white border-electric-blue'
                  : 'glass border-white/10 text-text-secondary hover:text-text-primary hover:border-electric-blue/30'
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Most Popular */}
      <section className="mb-12">
        <h2 className="font-display font-bold text-lg text-text-primary flex items-center gap-2 mb-5">
          <Gamepad2 size={20} className="text-electric-blue" /> Most Popular
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
          {popular.map((p, i) => <PopularCard key={p.id} product={p} rank={i + 1} />)}
        </div>
      </section>

      {/* All Games */}
      <section>
        <h2 className="font-display font-bold text-lg text-text-primary mb-5">All Games</h2>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-2"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          initial="hidden" animate="show"
        >
          {filtered.map((p, i) => (
            <SmallCard key={p.id || i} product={p} />
          ))}
        </motion.div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <Gamepad2 size={48} className="mx-auto mb-4 opacity-30" />
            <p>Tidak ada game yang ditemukan.</p>
          </div>
        )}
      </section>
    </div>
  )
}
