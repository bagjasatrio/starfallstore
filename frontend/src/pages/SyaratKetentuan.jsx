import React from 'react';
import { motion } from 'framer-motion';

export default function SyaratKetentuan() {
  return (
    <div className="container-sf py-12 pt-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-text-primary mb-4">
            Syarat & <span className="gradient-text">Ketentuan</span>
          </h1>
          <p className="text-text-muted">Pembaruan Terakhir: 1 Januari 2024</p>
        </div>

        <div className="glass rounded-2xl p-6 md:p-10 border border-white/5 space-y-8 text-text-muted leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">1. Pendahuluan</h2>
            <p>
              Selamat datang di StarfallStore. Dengan mengakses dan menggunakan layanan kami, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Harap baca dengan saksama sebelum melakukan transaksi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">2. Akun Pengguna</h2>
            <p>
              Pengguna bertanggung jawab penuh untuk menjaga kerahasiaan akun dan kata sandi. Segala aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya. Kami berhak memblokir akun yang melanggar ketentuan hukum atau merugikan pihak lain.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">3. Transaksi & Pembayaran</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Semua harga yang tertera adalah final dan dalam mata uang Rupiah (IDR).</li>
              <li>Pembayaran harus diselesaikan dalam batas waktu yang ditentukan. Pesanan akan otomatis dibatalkan jika melewati batas waktu.</li>
              <li>Produk digital (top up, voucher) yang telah berhasil dikirimkan tidak dapat dibatalkan atau dikembalikan (Non-refundable).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">4. Kebijakan Pengembalian Dana (Refund)</h2>
            <p>
              Pengembalian dana hanya berlaku jika terjadi kesalahan sistem dari pihak StarfallStore yang menyebabkan pesanan tidak dapat diproses. Dana akan dikembalikan ke saldo akun atau rekening pengguna sesuai dengan estimasi waktu bank terkait.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">5. Perubahan Syarat & Ketentuan</h2>
            <p>
              StarfallStore berhak mengubah, menambah, atau menghapus bagian mana pun dari Syarat & Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Pengguna diharapkan memeriksa halaman ini secara berkala.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
