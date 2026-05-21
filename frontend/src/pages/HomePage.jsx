import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Clock, TrendingUp, Star, ChevronRight, Gamepad2, Sword, Smartphone, Ticket, Monitor, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { productApi } from '../services/api'

const MotionLink = motion.create(Link)

const CATEGORIES = [
  { id: 'game',    label: 'Top Up Games',    icon: Gamepad2  },
  { id: 'joki',   label: 'Joki Rank',        icon: Sword     },
  { id: 'pulsa',  label: 'Pulsa & Data',     icon: Smartphone},
  { id: 'voucher',label: 'Voucher',          icon: Ticket    },
  { id: 'ewallet',label: 'Entertainment',   icon: Monitor   },
  { id: 'tagihan',label: 'Tagihan',          icon: FileText  },
]

const GENRE_COLORS = {
  MOBA: 'genre-moba', FPS: 'genre-fps', RPG: 'genre-rpg',
  'Battle Royale': 'genre-royale', Racing: 'genre-racing',
}

function formatRp(amount) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount)
}

function GameCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton h-48 rounded-t-lg" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

function GameCard({ product }) {
  const startingPrice = product.packages?.[0]?.selling_price ?? product.starting_price ?? 1500
  return (
    <MotionLink
      to={`/topup/${product.slug}`}
      variants={itemVariants}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0px 0px 30px rgba(6, 182, 212, 0.25)" 
      }}
      whileTap={{ scale: 0.95 }}
      className="glass-card overflow-hidden group cursor-pointer block border border-white/5 transition-colors hover:border-cyan-glow/50"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <motion.img
          src={product.banner_url || `https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/90 via-dark-navy/20 to-transparent" />
        {product.genre && (
          <span className={`genre-tag absolute top-3 left-3 ${GENRE_COLORS[product.genre] || 'genre-moba'}`}>
            {product.genre}
          </span>
        )}
      </div>
      <div className="p-5 relative z-10 bg-slate-900/40 backdrop-blur-sm border-t border-white/5">
        <h3 className="font-display font-semibold text-text-primary text-base group-hover:text-cyan-glow transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-text-muted mt-1">{product.publisher || 'Game Studio'}</p>
        <motion.div 
          className="flex items-center justify-between mt-4 pt-4 border-t border-white/5"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1, y: -2 }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-electric-blue to-cyan-glow flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              <Zap size={10} className="text-white" />
            </span>
            <p className="text-sm font-semibold text-white">
              {formatRp(startingPrice)}
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-glow opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Top Up <ChevronRight size={12} />
          </span>
        </motion.div>
      </div>
    </MotionLink>
  )
}

export default function HomePage({ openLogin, openRegister, loginModalOpen, registerModalOpen, setLoginModalOpen, setRegisterModalOpen }) {
  const [popularGames, setPopularGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('game')

  useEffect(() => {
    productApi.popular()
      .then(res => setPopularGames(res.data.products || []))
      .catch(() => setPopularGames(DEMO_GAMES))
      .finally(() => setLoading(false))
  }, [])

  const FEATURES = [
    { icon: Zap,    title: 'Proses Instan',    desc: 'Top up otomatis dalam hitungan detik.' },
    { icon: Shield, title: 'Super Aman',        desc: 'Enkripsi SSL & Validasi Webhook resmi.' },
    { icon: Clock,  title: 'Layanan 24/7',      desc: 'Server aktif sepanjang waktu.' },
    { icon: TrendingUp, title: 'Harga Terbaik', desc: 'Harga agen langsung, tanpa biaya tersembunyi.' },
  ]

  return (
    <div className="bg-grid">
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[520px] flex items-center">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-electric-blue/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-glow/8 rounded-full blur-[100px]" />
        </div>

        <div className="container-sf py-16 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric-blue/10 border border-electric-blue/20 mb-6 animate-fade-in">
              <Star size={12} className="text-electric-blue fill-electric-blue" />
              <span className="text-xs font-display font-semibold text-electric-blue tracking-wider uppercase">
                PROMO SPESIAL
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary leading-tight animate-fade-in-up">
              Top Up Game<br />
              <span className="gradient-text glow-text-cyan">Instant & Aman</span>
            </h1>

            <p className="text-text-secondary mt-4 text-base leading-relaxed animate-fade-in-up delay-100">
              Diskon hingga 30% untuk member baru. Proses otomatis 24/7 tanpa ribet.
              Didukung QRIS, VA, OVO, Dana, GoPay, dan ShopeePay.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8 animate-fade-in-up delay-200">
              <Link to="/topup" className="btn-primary py-3 px-7 text-base">
                Top Up Sekarang <ArrowRight size={16} />
              </Link>
              <Link to="/cek-transaksi" className="btn-secondary py-3 px-7 text-base">
                Cek Transaksi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Pills ────────────────────────────────────────────────── */}
      <section className="container-sf -mt-4 mb-16 md:mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="glass-card p-4 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-9 h-9 rounded-xl bg-electric-blue/10 flex items-center justify-center mb-3">
                <Icon size={18} className="text-electric-blue" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text-primary">{title}</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Chips ───────────────────────────────────────────────── */}
      <section className="container-sf mb-16 md:mb-24">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap text-sm font-display font-semibold border transition-all ${
                activeCategory === id
                  ? 'bg-electric-blue text-white border-electric-blue shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                  : 'glass border-white/10 text-text-secondary hover:border-electric-blue/30 hover:text-text-primary'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Game Populer ─────────────────────────────────────────────────── */}
      <section className="container-sf mb-24 md:mb-32">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
            <TrendingUp size={20} className="text-electric-blue" />
            Game Populer
          </h2>
          <Link to="/topup" className="flex items-center gap-1 text-sm text-electric-blue hover:text-cyan-glow transition-colors font-medium">
            Lihat Semua <ChevronRight size={16} />
          </Link>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 md:gap-14 px-2"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <GameCardSkeleton key={i} />)
            : (popularGames.length > 0 ? popularGames : DEMO_GAMES).slice(0, 5).map((game) => (
                <GameCard key={game.id || game.slug} product={game} />
              ))
          }
        </motion.div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="container-sf mb-24 md:mb-32">
        <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/5 via-transparent to-cyan-glow/5 pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-3 relative">
            Bergabunglah dengan <span className="gradient-text">500,000+</span> Gamer
          </h2>
          <p className="text-text-secondary mb-6 max-w-lg mx-auto">
            Dapatkan promo eksklusif, cashback, dan harga terbaik setiap hari.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={openRegister} className="btn-primary py-3 px-8">
              <Zap size={16} /> Daftar Gratis
            </button>
            <Link to="/topup" className="btn-secondary py-3 px-8">
              Explore Games
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// Demo data for when API is unavailable
const DEMO_GAMES = [
  { id: 1, name: 'Mobile Legends', slug: 'mobile-legends', genre: 'MOBA', publisher: 'Moonton', banner_url: 'https://picsum.photos/seed/ml/400/240', starting_price: 1500 },
  { id: 2, name: 'Valorant', slug: 'valorant', genre: 'FPS', publisher: 'Riot Games', banner_url: 'https://picsum.photos/seed/val/400/240', starting_price: 15000 },
  { id: 3, name: 'Genshin Impact', slug: 'genshin-impact', genre: 'RPG', publisher: 'HoYoverse', banner_url: 'https://picsum.photos/seed/gi/400/240', starting_price: 16500 },
  { id: 4, name: 'PUBG Mobile', slug: 'pubg-mobile', genre: 'Battle Royale', publisher: 'Level Infinite', banner_url: 'https://picsum.photos/seed/pubg/400/240', starting_price: 3500 },
  { id: 5, name: 'Free Fire', slug: 'free-fire', genre: 'Battle Royale', publisher: 'Garena', banner_url: 'https://picsum.photos/seed/ff/400/240', starting_price: 1000 },
]
