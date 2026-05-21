import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, HeadphonesIcon } from 'lucide-react';

export default function TentangKami() {
  const features = [
    {
      icon: <Zap className="text-cyan-glow" size={32} />,
      title: "Proses Instan",
      desc: "Top up dan layanan digital diproses dalam hitungan detik setelah pembayaran berhasil."
    },
    {
      icon: <Shield className="text-emerald-400" size={32} />,
      title: "Transaksi Aman",
      desc: "Dilengkapi sistem keamanan enkripsi tingkat tinggi untuk melindungi data Anda."
    },
    {
      icon: <HeadphonesIcon className="text-electric-blue" size={32} />,
      title: "Layanan 24/7",
      desc: "Tim dukungan pelanggan kami selalu siap membantu Anda kapan pun dibutuhkan."
    }
  ];

  return (
    <div className="container-sf py-12 pt-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-text-primary mb-6">
            Tentang <span className="gradient-text">StarfallStore</span>
          </h1>
          <p className="text-text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            Platform Top Up Game dan Layanan Digital terkemuka yang menyajikan pengalaman bertransaksi yang cepat, premium, dan dapat diandalkan oleh para Gamers di seluruh Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feat, idx) => (
            <div key={idx} className="glass p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{feat.title}</h3>
              <p className="text-sm text-text-muted">{feat.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 md:p-10 border border-white/5 text-text-muted leading-relaxed">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Misi Kami</h2>
          <p className="mb-6">
            Di StarfallStore, kami percaya bahwa setiap gamer berhak mendapatkan akses yang mudah dan murah tanpa harus mengorbankan keamanan. Kami membangun infrastruktur ini dengan teknologi mikro-servis terkini, menyediakan antarmuka pengguna yang bersih *(glassmorphic)* dan sistem otomatisasi (H2H) agar item favorit Anda mendarat seketika.
          </p>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Kenapa Memilih Kami?</h2>
          <p>
            Berawal dari rasa frustrasi terhadap sistem top-up yang berbelit-belit, StarfallStore lahir sebagai jawaban. Kami menghadirkan integrasi langsung dengan gerbang pembayaran lokal, melacak pesanan secara publik, dan memberikan transparansi harga yang memanjakan. Bersama kami, melangkah menuju dominasi in-game jadi lebih indah.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
