import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
      q: "Berapa lama proses top-up masuk ke akun saya?",
      a: "Sebagian besar produk game dan layanan kami diproses secara otomatis *(Instant)* dalam 1-5 detik setelah pembayaran Anda dikonfirmasi oleh sistem."
    },
    {
      q: "Apa yang harus dilakukan jika pesanan berstatus 'Pending'?",
      a: "Status Pending biasanya berarti pembayaran belum diterima atau sedang dalam antrean padat dari pihak server game. Tunggu maksimal 15 menit. Jika masih belum masuk, hubungi CS kami dengan menyertakan Invoice ID."
    },
    {
      q: "Apakah transaksi di StarfallStore aman?",
      a: "100% Aman. Kami merupakan agen resmi yang terintegrasi langsung dengan principal (H2H). Semua data pelanggan dienkripsi dan kami tidak akan pernah meminta password in-game Anda (kecuali untuk layanan joki tertentu)."
    },
    {
      q: "Bagaimana cara melacak pesanan tanpa login?",
      a: "Anda bisa menggunakan fitur 'Cek Transaksi' di menu atas. Masukkan nomor Invoice atau Nomor HP yang Anda gunakan saat membeli, lalu sistem akan menampilkan status pesanan Anda secara *real-time*."
    },
    {
      q: "Metode pembayaran apa saja yang tersedia?",
      a: "Kami mendukung QRIS (OVO, GoPay, Dana, LinkAja, ShopeePay), Virtual Account Bank (BCA, Mandiri, BRI, BNI), serta pembayaran melalui minimarket (Alfamart, Indomaret)."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container-sf py-12 pt-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-text-primary mb-4">
            Tanya <span className="gradient-text">Jawab</span> (FAQ)
          </h1>
          <p className="text-text-muted text-lg">Pertanyaan yang sering diajukan seputar StarfallStore.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass rounded-xl border border-white/5 overflow-hidden">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-5 text-left bg-transparent hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-text-primary pr-8">{faq.q}</span>
                <ChevronDown
                  size={20}
                  className={`text-text-muted shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-5 pt-0 text-text-muted border-t border-white/5 mt-2">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-text-muted mb-4">Tidak menemukan jawaban yang Anda cari?</p>
          <a href="/dukungan" className="inline-block px-6 py-2.5 rounded-xl bg-cyan-glow/20 text-cyan-glow font-semibold border border-cyan-glow/30 hover:bg-cyan-glow/30 transition-colors">
            Hubungi CS Kami
          </a>
        </div>
      </motion.div>
    </div>
  );
}
