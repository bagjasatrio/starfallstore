import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, MapPin } from 'lucide-react';

export default function HubungiKami() {
  const waNumber = import.meta.env.VITE_CS_WHATSAPP_NUMBER || '6283874644294';
  const tgUsername = import.meta.env.VITE_CS_TELEGRAM_USERNAME || 'starfall_cs';

  return (
    <div className="container-sf py-12 pt-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-text-primary mb-4">
            Hubungi <span className="gradient-text">Kami</span>
          </h1>
          <p className="text-text-muted text-lg">Ada pertanyaan atau kendala? Tim kami siap membantu Anda 24/7.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <a
            href={`https://wa.me/${waNumber}?text=Halo%20StarfallStore...`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all flex items-start gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <MessageCircle className="text-emerald-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-emerald-400 transition-colors">WhatsApp Support</h3>
              <p className="text-sm text-text-muted">Respon instan untuk kendala top-up dan pertanyaan umum.</p>
            </div>
          </a>

          <a
            href={`https://t.me/${tgUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass p-6 rounded-2xl border border-white/5 hover:border-electric-blue/30 transition-all flex items-start gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-electric-blue/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-electric-blue" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.306-.346-.111l-6.4 4.024-2.76-.864c-.6-.188-.616-.605.126-.894l10.785-4.158c.499-.187.942.115.775.844z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-electric-blue transition-colors">Telegram Community</h3>
              <p className="text-sm text-text-muted">Gabung grup untuk info promo, diskon, dan turnamen terbaru.</p>
            </div>
          </a>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8 border border-white/5">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="text-cyan-glow mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-text-primary">Email Bisnis & Kerjasama</h4>
                <p className="text-text-muted text-sm">partnership@starfallstore.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="text-cyan-glow mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-text-primary">Alamat Kantor Pusat</h4>
                <p className="text-text-muted text-sm">
                  Gedung Cyber 2, Lt 18<br/>
                  Jl. H. R. Rasuna Said Blok X-5<br/>
                  Jakarta Selatan, Indonesia 12950
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
