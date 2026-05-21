import React from 'react';
import { motion } from 'framer-motion';

export default function KebijakanPrivasi() {
  return (
    <div className="container-sf py-12 pt-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-text-primary mb-4">
            Kebijakan <span className="gradient-text">Privasi</span>
          </h1>
          <p className="text-text-muted">Pembaruan Terakhir: 1 Januari 2024</p>
        </div>

        <div className="glass rounded-2xl p-6 md:p-10 border border-white/5 space-y-8 text-text-muted leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">1. Pengumpulan Data Informasi</h2>
            <p>
              StarfallStore mengumpulkan informasi pribadi saat Anda mendaftar, melakukan transaksi, atau menghubungi layanan pelanggan kami. Informasi ini mencakup nama, alamat email, nomor telepon, dan data transaksi. Kami juga secara otomatis mencatat data dari peramban Anda, termasuk IP address dan cookie.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">2. Penggunaan Informasi</h2>
            <p>
              Data yang kami kumpulkan digunakan untuk:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Memproses pesanan dan transaksi Anda.</li>
              <li>Meningkatkan layanan dan antarmuka pengguna situs kami.</li>
              <li>Menghubungi Anda terkait status pesanan, promosi, atau informasi akun.</li>
              <li>Mencegah aktivitas penipuan dan menjaga keamanan akun.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">3. Keamanan Data</h2>
            <p>
              Kami menerapkan standar enkripsi industri (SSL) untuk melindungi transmisi data sensitif Anda. Kami tidak menyimpan informasi detail kartu kredit Anda secara langsung di server kami; semua pembayaran diproses oleh penyedia gerbang pembayaran (payment gateway) berlisensi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">4. Pembagian Informasi kepada Pihak Ketiga</h2>
            <p>
              Kami tidak akan menjual, menyewakan, atau menukar informasi pribadi Anda kepada pihak ketiga. Kami hanya membagikan data yang diperlukan kepada mitra penyedia layanan (seperti Digiflazz untuk pemrosesan produk) dengan kewajiban kerahasiaan yang ketat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">5. Hak Pengguna</h2>
            <p>
              Anda memiliki hak untuk mengakses, memperbarui, atau menghapus informasi pribadi Anda. Jika Anda ingin menghapus akun sepenuhnya dari sistem kami, silakan hubungi tim dukungan pelanggan kami.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
