import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Radio, Wallet, FileText, Ticket, ArrowRight } from 'lucide-react'

const SERVICES = [
  {
    id: 'pulsa',
    icon: Radio,
    title: 'Pulsa & Paket Data',
    desc: 'Top up pulsa semua operator dan beli paket internet super cepat dengan harga agen.',
    tags: [],
    color: 'from-blue-600/20 to-blue-500/5',
    iconBg: 'bg-blue-500/10 text-blue-400',
    to: '/topup?category=pulsa',
    size: 'large',
  },
  {
    id: 'ewallet',
    icon: Wallet,
    title: 'E-Wallet Top Up',
    desc: 'Isi saldo e-wallet favorit Anda secara instan. Dukung semua e-wallet populer.',
    tags: ['OVO', 'Dana', 'GoPay'],
    color: 'from-purple-600/20 to-purple-500/5',
    iconBg: 'bg-purple-500/10 text-purple-400',
    to: '/topup?category=ewallet',
    size: 'small',
  },
  {
    id: 'tagihan',
    icon: FileText,
    title: 'Tagihan & Utilitas',
    desc: 'Bayar tagihan bulanan tanpa antri, langsung terkonfirmasi.',
    tags: ['PLN', 'PDAM', 'BPJS'],
    color: 'from-cyan-600/20 to-cyan-500/5',
    iconBg: 'bg-cyan-500/10 text-cyan-400',
    to: '/topup?category=tagihan',
    size: 'small',
  },
  {
    id: 'voucher',
    icon: Ticket,
    title: 'Voucher Digital',
    desc: 'Beli voucher streaming film, musik, dan belanja online dengan mudah.',
    tags: ['Streaming', 'Belanja'],
    color: 'from-orange-600/20 to-orange-500/5',
    iconBg: 'bg-orange-500/10 text-orange-400',
    to: '/topup?category=voucher',
    size: 'small',
  },
]

export default function DigitalServices() {
  useEffect(() => { document.title = 'Layanan Digital | StarfallStore' }, [])

  return (
    <div className="container-sf py-8 min-h-screen">
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Layanan Digital & Tagihan</h1>
        <p className="text-text-secondary max-w-xl">
          Penuhi kebutuhan digital harian Anda dengan cepat, aman, dan tanpa biaya tersembunyi. Transaksi instan 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SERVICES.map((s, i) => {
          const Icon = s.icon
          return (
            <Link key={s.id} to={s.to}
              className={`glass-card p-7 group relative overflow-hidden bg-gradient-to-br ${s.color} animate-fade-in-up`}
              style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center`}>
                  <Icon size={26} />
                </div>
                <ArrowRight size={20} className="text-text-muted group-hover:text-electric-blue group-hover:translate-x-1 transition-all" />
              </div>
              {s.tags.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {s.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-text-muted border border-white/10">{t}</span>
                  ))}
                </div>
              )}
              <h3 className="font-display font-bold text-lg text-text-primary mb-2 group-hover:text-electric-blue transition-colors">
                {s.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">{s.desc}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
