import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Database, Plus, Trash2, X, AlertCircle, Eye, EyeOff, Search, RefreshCw, UploadCloud } from 'lucide-react'
import { adminApi, productApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminStock() {
  const [stock, setStock] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [filters, setFilters] = useState({ product_id: '', status: '' })
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  // Form states
  const [selectedProductId, setSelectedProductId] = useState('')
  const [notes, setNotes] = useState('')
  const [uploadType, setUploadType] = useState('single') // single or bulk
  // Single form
  const [singleCreds, setSingleCreds] = useState({ username: '', password: '', recovery_code: '' })
  // Bulk form
  const [bulkText, setBulkText] = useState('') // format: username|password|recovery

  const [visibleCreds, setVisibleCreds] = useState({}) // ID -> bool mapping

  const fetchStock = async () => {
    setLoading(true)
    try {
      const res = await adminApi.stock({ ...filters, page })
      setStock(res.data.data)
      setMeta(res.data)
    } catch (err) {
      toast.error('Gagal memuat inventori stok')
    } finally {
      setLoading(false)
    }
  }

  const fetchProductsList = async () => {
    try {
      const res = await adminApi.products()
      setProducts(res.data)
    } catch (err) {}
  }

  useEffect(() => {
    fetchStock()
  }, [page, filters.product_id, filters.status])

  useEffect(() => {
    fetchProductsList()
  }, [])

  const openAdd = () => {
    setSelectedProductId(products[0]?.id || '')
    setNotes('')
    setSingleCreds({ username: '', password: '', recovery_code: '' })
    setBulkText('')
    setUploadType('single')
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!selectedProductId) {
      toast.error('Pilih produk terlebih dahulu')
      return
    }

    setSaveLoading(true)
    try {
      let payload = {
        product_id: selectedProductId,
        notes: notes || null,
      }

      if (uploadType === 'single') {
        if (!singleCreds.username || !singleCreds.password) {
          toast.error('Username dan Password wajib diisi')
          setSaveLoading(false)
          return
        }
        payload.credentials = singleCreds
      } else {
        if (!bulkText.trim()) {
          toast.error('Data bulk wajib diisi')
          setSaveLoading(false)
          return
        }

        const lines = bulkText.trim().split('\n')
        const bulkItems = lines.map(line => {
          const parts = line.split('|')
          return {
            credentials: {
              username: parts[0]?.trim() || '',
              password: parts[1]?.trim() || '',
              recovery_code: parts[2]?.trim() || '',
            },
            notes: notes || null,
          }
        }).filter(item => item.credentials.username && item.credentials.password)

        if (bulkItems.length === 0) {
          toast.error('Format bulk tidak valid. Gunakan format: username|password')
          setSaveLoading(false)
          return
        }

        payload.bulk = bulkItems
      }

      await adminApi.stockCreate(payload)
      toast.success('Stok akun berhasil ditambahkan!')
      setModalOpen(false)
      fetchStock()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan stok')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus stok akun ini?')) return
    try {
      await adminApi.stockDelete(id)
      toast.success('Stok akun berhasil dihapus!')
      fetchStock()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus stok')
    }
  }

  const toggleCredentialsVisibility = (id) => {
    setVisibleCreds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-text-primary">Kelola Stok Akun Premium</h2>
          <p className="text-sm text-text-muted mt-1">Kelola stok akun game premium/digital terenkripsi (Host-to-Host).</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={16} /> Tambah / Upload Stok
        </button>
      </div>

      {/* Filters */}
      <div className="glass p-5 rounded-2xl border border-white/5 mb-6 flex flex-wrap gap-4 items-end">
        <div className="w-64">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Filter Game / Layanan</label>
          <select
            className="input-dark py-2.5 text-sm"
            value={filters.product_id}
            onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}
          >
            <option value="">Semua Game / Layanan</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="w-48">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Status Stok</label>
          <select
            className="input-dark py-2.5 text-sm"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Semua Status</option>
            <option value="available">Tersedia (Ready)</option>
            <option value="sold">Terjual (Sold Out)</option>
          </select>
        </div>

        <button onClick={fetchStock} className="btn-secondary py-2.5 px-4 text-sm flex items-center gap-2 ml-auto">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Inventory Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            <div className="skeleton h-8 w-full rounded-lg" />
            <div className="skeleton h-8 w-full rounded-lg" />
            <div className="skeleton h-8 w-full rounded-lg" />
          </div>
        ) : stock.length === 0 ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
            <Database size={32} className="text-white/20" />
            <p>Belum ada persediaan akun premium.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">ID / Tanggal</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Produk / Layanan</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Kredensial Akun (Terenkripsi)</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Catatan Admin</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stock.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-mono text-text-primary">#{s.id}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{new Date(s.created_at).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-text-primary">{s.product?.name}</p>
                    </td>
                    <td className="p-4 min-w-[280px]">
                      {visibleCreds[s.id] ? (
                        <div className="text-xs font-mono bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                          <p><span className="text-text-muted">USER:</span> {s.credentials?.username}</p>
                          <p><span className="text-text-muted">PASS:</span> {s.credentials?.password}</p>
                          {s.credentials?.recovery_code && <p><span className="text-text-muted">RECOV:</span> {s.credentials.recovery_code}</p>}
                        </div>
                      ) : (
                        <div className="text-xs text-text-muted font-mono bg-white/[0.02] p-2.5 rounded-lg border border-white/5 italic">
                          •••••••• (Kredensial Terenkripsi AES)
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-text-muted line-clamp-2 max-w-[180px]">{s.notes || '-'}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        s.status === 'available' ? 'bg-success/15 text-success border border-success/20' : 'bg-white/10 text-text-muted border border-white/5'
                      }`}>
                        {s.status === 'available' ? 'Ready' : 'Sold Out'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleCredentialsVisibility(s.id)} className="btn-secondary p-2 text-xs flex items-center justify-center shrink-0">
                          {visibleCreds[s.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        {s.status !== 'sold' && (
                          <button onClick={() => handleDelete(s.id)} className="btn-secondary p-2 text-xs text-error hover:bg-error/5 flex items-center justify-center shrink-0">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">
              Previous
            </button>
            <span className="text-xs text-text-muted">Page {page} of {meta.last_page}</span>
            <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700 shadow-2xl rounded-2xl flex flex-col max-h-[90vh] overflow-hidden text-white">
            <form onSubmit={handleSave} className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50 shrink-0">
                <div>
                  <h3 className="text-lg font-display font-bold text-white">Tambah Persediaan Akun</h3>
                  <p className="text-xs text-slate-400 mt-1">Upload akun digital premium terenkripsi otomatis.</p>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Pilih Game / Layanan</label>
                  <select
                    className="input-dark text-sm py-2"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                  >
                    <option value="">Pilih Produk...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Tipe Upload</label>
                  <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${uploadType === 'single' ? 'bg-electric-blue text-text-primary shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                      onClick={() => setUploadType('single')}
                    >
                      Satu Akun (Form)
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${uploadType === 'bulk' ? 'bg-electric-blue text-text-primary shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                      onClick={() => setUploadType('bulk')}
                    >
                      Bulk Copy-Paste
                    </button>
                  </div>
                </div>

                {uploadType === 'single' ? (
                  <div className="space-y-4 bg-white/[0.01] p-4 rounded-xl border border-white/5">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Username / Email Akun</label>
                      <input
                        type="text"
                        className="input-dark text-sm py-2"
                        placeholder="john_doe@email.com"
                        value={singleCreds.username}
                        onChange={(e) => setSingleCreds({ ...singleCreds, username: e.target.value })}
                        required={uploadType === 'single'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Kata Sandi (Password)</label>
                      <input
                        type="text"
                        className="input-dark text-sm py-2"
                        placeholder="password123"
                        value={singleCreds.password}
                        onChange={(e) => setSingleCreds({ ...singleCreds, password: e.target.value })}
                        required={uploadType === 'single'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Kode Pemulihan / Backups (Opsional)</label>
                      <input
                        type="text"
                        className="input-dark text-sm py-2"
                        placeholder="12345678, recovery-code-abc"
                        value={singleCreds.recovery_code}
                        onChange={(e) => setSingleCreds({ ...singleCreds, recovery_code: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Data Kredensial Bulk</label>
                      <textarea
                        rows={6}
                        className="input-dark text-xs py-2 font-mono"
                        placeholder="username|password&#10;username|password|recovery_code&#10;username|password|recovery_code"
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        required={uploadType === 'bulk'}
                      />
                    </div>
                    <div className="flex gap-2 items-start p-3 bg-white/5 rounded-xl text-[10px] text-text-muted leading-relaxed">
                      <UploadCloud size={14} className="shrink-0 text-electric-blue" />
                      <span>Format per baris: <strong>username|password|recovery_code</strong>. Baris kosong atau baris tanpa username/password akan dilewati secara otomatis.</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Catatan Internal Admin (Opsional)</label>
                  <textarea
                    rows={2}
                    className="input-dark text-sm py-2"
                    placeholder="e.g. Batch #1 MLBB, Akun Smurf lvl 30"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-700/50 bg-slate-900/50 flex gap-3 shrink-0">
                <button type="button" onClick={() => setModalOpen(false)} className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors flex-1">
                  Batal
                </button>
                <button type="submit" disabled={saveLoading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 flex-1">
                  {saveLoading ? 'Menyimpan...' : 'Upload & Enkrip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
