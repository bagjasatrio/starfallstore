import React from 'react';
import { motion } from 'framer-motion';

export default function MetodePembayaran() {
  const categories = [
    {
      title: "E-Wallet",
      methods: ["QRIS", "GoPay", "OVO", "DANA", "ShopeePay", "LinkAja"]
    },
    {
      title: "Virtual Account (Bank Transfer)",
      methods: ["BCA Virtual Account", "Mandiri Virtual Account", "BNI Virtual Account", "BRI Virtual Account", "Permata Virtual Account"]
    },
    {
      title: "Retail / Minimarket",
      methods: ["Alfamart", "Indomaret"]
    }
  ];

  return (
    <div className="container-sf py-12 pt-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-text-primary mb-4">
            Metode <span className="gradient-text">Pembayaran</span>
          </h1>
          <p className="text-text-muted text-lg">Berbagai pilihan pembayaran instan dan aman, tersedia 24 jam.</p>
        </div>

        <div className="space-y-6">
          {categories.map((category, idx) => (
            <div key={idx} className="glass rounded-2xl p-6 border border-white/5">
              <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <div className="w-2 h-6 rounded-full bg-cyan-glow"></div>
                {category.title}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {category.methods.map((method, methodIdx) => (
                  <div key={methodIdx} className="bg-surface-high/50 border border-outline/30 rounded-xl p-4 text-center hover:border-cyan-glow/50 transition-colors">
                    <span className="text-sm font-semibold text-text-primary">{method}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 glass rounded-2xl p-6 border border-electric-blue/30 bg-electric-blue/5">
          <h3 className="text-lg font-bold text-text-primary mb-2">Informasi Penting</h3>
          <ul className="list-disc pl-5 text-sm text-text-muted space-y-2">
            <li>Semua transaksi diverifikasi secara otomatis (Instant Approval).</li>
            <li>Harap lakukan pembayaran sesuai dengan nominal yang tertera hingga tiga digit terakhir.</li>
            <li>Biaya admin mungkin berlaku tergantung pada metode pembayaran yang dipilih (ditampilkan saat checkout).</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
