import React from 'react'
import { Link } from 'react-router-dom'
import { Rocket } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl font-display font-black gradient-text mb-4">404</div>
      <h1 className="text-2xl font-display font-bold text-text-primary mb-3">Halaman Tidak Ditemukan</h1>
      <p className="text-text-muted mb-8 max-w-sm">Sepertinya Anda tersesat di galaksi. Halaman yang Anda cari tidak ada.</p>
      <Link to="/" className="btn-primary py-3 px-7"><Rocket size={16} /> Kembali ke Beranda</Link>
    </div>
  )
}
