import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Package, Plus, Edit2, Trash2, X, AlertCircle, Save, PlusCircle } from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'

function formatRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(n) || 0) }

const DEFAULT_FORM = {
  name: '',
  category: 'game',
  game_code: '',
  publisher: '',
  banner_url: '',
  thumbnail_url: '',
  description: '',
  platforms: ['Mobile', 'PC'],
  genre: '',
  is_active: true,
  requires_server_id: false,
  sort_order: 0,
  packages: [],
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await adminApi.products()
      setProducts(res.data)
    } catch (err) {
      toast.error('Gagal memuat produk')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const openAdd = () => {
    setForm(DEFAULT_FORM)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = async (product) => {
    setSaveLoading(true)
    try {
      const res = await adminApi.productShow(product.id)
      setForm(res.data)
      setEditingId(product.id)
      setModalOpen(true)
    } catch (err) {
      toast.error('Gagal mengambil rincian produk')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    try {
      if (editingId) {
        await adminApi.productUpdate(editingId, form)
        toast.success('Produk berhasil diubah!')
      } else {
        await adminApi.productCreate(form)
        toast.success('Produk berhasil dibuat!')
      }
      setModalOpen(false)
      fetchProducts()
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan produk'
      toast.error(msg)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini? Semua paket di dalamnya juga akan terhapus secara permanen.')) return
    try {
      await adminApi.productDelete(id)
      toast.success('Produk berhasil dihapus!')
      fetchProducts()
    } catch (err) {
      toast.error('Gagal menghapus produk')
    }
  }

  // Packages Subform Helpers
  const addPackageField = () => {
    setForm({
      ...form,
      packages: [
        ...form.packages,
        { name: '', sku: '', description: '', base_price: 0, selling_price: 0, quantity: 1, currency_label: 'Diamonds', is_active: true, is_popular: false, sort_order: 0 }
      ]
    })
  }

  const removePackageField = (index) => {
    setForm({
      ...form,
      packages: form.packages.filter((_, i) => i !== index)
    })
  }

  const updatePackageField = (index, field, value) => {
    const updated = [...form.packages]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, packages: updated })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-text-primary">Kelola Katalog Produk</h2>
          <p className="text-sm text-text-muted mt-1">Kelola nama game, data Digiflazz, dan detail paket nominal top-up.</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={16} /> Tambah Game / Layanan
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="glass p-12 text-center text-text-muted rounded-2xl border border-white/5 flex flex-col items-center gap-2">
          <Package size={32} className="text-white/20" />
          <p>Katalog produk kosong. Tambahkan game pertamamu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="glass border border-white/5 rounded-2xl overflow-hidden hover:border-electric-blue/30 transition-all flex flex-col justify-between group">
              <div className="relative h-28 overflow-hidden bg-black/40">
                <img
                  src={p.banner_url || 'https://picsum.photos/seed/sf/800/300'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                />
                <div className="absolute left-4 bottom-[-16px] w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/40 bg-zinc-900">
                  <img src={p.thumbnail_url || 'https://picsum.photos/seed/ml/100/100'} alt="" className="w-full h-full object-cover" />
                </div>
                <span className={`absolute right-4 top-4 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  p.is_active ? 'bg-success/15 text-success border border-success/20' : 'bg-error/15 text-error border border-error/20'
                }`}>
                  {p.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <div className="p-5 pt-7">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-bold text-text-primary text-base line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-text-muted mt-1 uppercase tracking-wider">{p.category} • {p.genre || 'N/A'}</p>
                  </div>
                  <span className="text-xs bg-white/5 text-text-secondary px-2.5 py-1 rounded-lg border border-white/5 font-semibold shrink-0">
                    {p.packages_count || 0} Paket
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-3 line-clamp-2">{p.description || 'Tidak ada deskripsi.'}</p>
              </div>

              <div className="flex border-t border-white/5 bg-white/[0.01]">
                <button onClick={() => openEdit(p)} className="flex-1 py-3 text-xs font-semibold text-text-secondary hover:text-text-primary border-r border-white/5 hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5">
                  <Edit2 size={13} /> Edit Catalog
                </button>
                <button onClick={() => handleDelete(p.id)} className="flex-1 py-3 text-xs font-semibold text-error hover:bg-error/5 transition-colors flex items-center justify-center gap-1.5">
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700 shadow-2xl rounded-2xl flex flex-col max-h-[90vh] overflow-hidden text-white">
            <form onSubmit={handleSave} className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50 shrink-0">
                <div>
                  <h3 className="text-lg font-display font-bold text-white">{editingId ? 'Edit Game Catalog' : 'Tambah Game Baru'}</h3>
                  <p className="text-xs text-slate-400 mt-1">Kelola data meta, visual assets, dan paket-paket penjualan.</p>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Meta Informasi Game</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">Nama Game / Layanan</label>
                    <input
                      type="text"
                      className="input-dark text-sm py-2"
                      placeholder="e.g. Mobile Legends"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">Kategori</label>
                    <select
                      className="input-dark text-sm py-2"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="game">Games Top Up</option>
                      <option value="pulsa">Pulsa & Data</option>
                      <option value="ewallet">E-Wallet</option>
                      <option value="voucher">Voucher</option>
                      <option value="tagihan">Tagihan</option>
                      <option value="joki">Rank Joki</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">Digiflazz Game Code Prefix</label>
                    <input
                      type="text"
                      className="input-dark text-sm py-2 font-mono"
                      placeholder="e.g. mobile-legend"
                      value={form.game_code || ''}
                      onChange={(e) => setForm({ ...form, game_code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">Publisher</label>
                    <input
                      type="text"
                      className="input-dark text-sm py-2"
                      placeholder="e.g. Moonton"
                      value={form.publisher || ''}
                      onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">Genre / Tag</label>
                    <input
                      type="text"
                      className="input-dark text-sm py-2"
                      placeholder="e.g. MOBA"
                      value={form.genre || ''}
                      onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">URL Thumbnail (Image square)</label>
                    <input
                      type="url"
                      className="input-dark text-sm py-2"
                      placeholder="https://..."
                      value={form.thumbnail_url || ''}
                      onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">URL Banner (Landscape)</label>
                    <input
                      type="url"
                      className="input-dark text-sm py-2"
                      placeholder="https://..."
                      value={form.banner_url || ''}
                      onChange={(e) => setForm({ ...form, banner_url: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Deskripsi Produk</label>
                  <textarea
                    rows={2}
                    className="input-dark text-sm py-2"
                    placeholder="Tulis ringkasan mengenai top up game ini..."
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-6 items-center bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <label className="flex items-center gap-2.5 text-xs text-text-secondary font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded bg-black/40 border-white/10 text-electric-blue focus:ring-0 w-4 h-4 cursor-pointer"
                      checked={form.requires_server_id}
                      onChange={(e) => setForm({ ...form, requires_server_id: e.target.checked })}
                    />
                    Wajib Server ID? (e.g. MLBB, Genshin)
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-text-secondary font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded bg-black/40 border-white/10 text-electric-blue focus:ring-0 w-4 h-4 cursor-pointer"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    Status Aktif (Tampil di Toko)
                  </label>

                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Urutan Sort</label>
                    <input
                      type="number"
                      className="input-dark text-xs py-1 w-20"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Packages Subform */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Item / Paket Penjualan ({form.packages?.length || 0})</h4>
                  <button type="button" onClick={addPackageField} className="flex items-center gap-1.5 text-xs font-semibold text-electric-blue hover:text-cyan-glow transition-all">
                    <PlusCircle size={14} /> Tambah Item Baru
                  </button>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {form.packages?.length === 0 ? (
                    <p className="text-xs text-center text-text-muted py-6">Belum ada item/paket penjualan. Klik tombol diatas untuk menambahkan.</p>
                  ) : (
                    form.packages.map((pkg, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-3 relative group">
                        <button type="button" onClick={() => removePackageField(idx)} className="absolute right-3 top-3 p-1 rounded hover:bg-white/5 text-text-muted hover:text-error transition-colors">
                          <X size={14} />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3 pr-6">
                          <div>
                            <label className="block text-[10px] font-semibold text-text-muted uppercase mb-1">Nama Item</label>
                            <input
                              type="text"
                              className="input-dark text-xs py-1.5"
                              placeholder="e.g. 5 Diamonds"
                              value={pkg.name}
                              onChange={(e) => updatePackageField(idx, 'name', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-text-muted uppercase mb-1">SKU Code (Digiflazz Code)</label>
                            <input
                              type="text"
                              className="input-dark text-xs py-1.5 font-mono"
                              placeholder="e.g. ML-D5"
                              value={pkg.sku}
                              onChange={(e) => updatePackageField(idx, 'sku', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-semibold text-text-muted uppercase mb-1">Harga Pokok (H2H)</label>
                            <input
                              type="number"
                              className="input-dark text-xs py-1.5"
                              value={pkg.base_price}
                              onChange={(e) => updatePackageField(idx, 'base_price', parseFloat(e.target.value) || 0)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-text-muted uppercase mb-1">Harga Jual</label>
                            <input
                              type="number"
                              className="input-dark text-xs py-1.5"
                              value={pkg.selling_price}
                              onChange={(e) => updatePackageField(idx, 'selling_price', parseFloat(e.target.value) || 0)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-text-muted uppercase mb-1">Jumlah</label>
                            <input
                              type="number"
                              className="input-dark text-xs py-1.5"
                              value={pkg.quantity}
                              onChange={(e) => updatePackageField(idx, 'quantity', parseInt(e.target.value) || 1)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-text-muted uppercase mb-1">Label Satuan</label>
                            <input
                              type="text"
                              className="input-dark text-xs py-1.5"
                              placeholder="e.g. Diamonds"
                              value={pkg.currency_label}
                              onChange={(e) => updatePackageField(idx, 'currency_label', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="flex gap-4 items-center pt-1 border-t border-white/[0.03]">
                          <label className="flex items-center gap-2 text-[10px] text-text-secondary cursor-pointer">
                            <input
                              type="checkbox"
                              className="rounded bg-black/40 border-white/10 text-electric-blue focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                              checked={pkg.is_active}
                              onChange={(e) => updatePackageField(idx, 'is_active', e.target.checked)}
                            />
                            Aktif
                          </label>

                          <label className="flex items-center gap-2 text-[10px] text-text-secondary cursor-pointer">
                            <input
                              type="checkbox"
                              className="rounded bg-black/40 border-white/10 text-electric-blue focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                              checked={pkg.is_popular}
                              onChange={(e) => updatePackageField(idx, 'is_popular', e.target.checked)}
                            />
                            Rekomendasi
                          </label>

                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-[10px] text-text-muted uppercase font-bold">Sort:</span>
                            <input
                              type="number"
                              className="input-dark text-[10px] py-0.5 w-14"
                              value={pkg.sort_order}
                              onChange={(e) => updatePackageField(idx, 'sort_order', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-700/50 bg-slate-900/50 flex gap-3 shrink-0">
                <button type="button" onClick={() => setModalOpen(false)} className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors flex-1">
                  Batal
                </button>
                <button type="submit" disabled={saveLoading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 flex-1">
                  <Save size={16} /> {saveLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
