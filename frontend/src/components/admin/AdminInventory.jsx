import React, { useEffect, useState } from 'react'
import { 
  Database, 
  Plus, 
  Trash2, 
  X, 
  Eye, 
  EyeOff, 
  Search, 
  RefreshCw, 
  UploadCloud, 
  TrendingUp,
  FileText,
  AlertTriangle,
  PlayCircle,
  Edit2
} from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminInventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  
  // Stats
  const [stats, setStats] = useState({
    total_stock: 0,
    available_stock: 0,
    hold_stock: 0,
    sold_today: 0
  })
  
  // Filters & Pagination
  const [productsList, setProductsList] = useState([])
  const [filters, setFilters] = useState({ search: '', status: '', product_name: '' })
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  // Add Form states
  const [productName, setProductName] = useState('')
  const [digiflazzSku, setDigiflazzSku] = useState('')
  const [uploadMode, setUploadMode] = useState('single') // single or bulk
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bulkData, setBulkData] = useState('')

  // Edit Form states
  const [editingId, setEditingId] = useState(null)
  const [editProductName, setEditProductName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editDigiflazzSku, setEditDigiflazzSku] = useState('')
  const [editStatus, setEditStatus] = useState('available')

  // Reveals state (map of item index / id -> bool)
  const [revealedCreds, setRevealedCreds] = useState({})

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const res = await adminApi.inventoryList({ ...filters, page })
      setInventory(res.data.data)
      setStats(res.data.stats)
      setMeta(res.data.meta)
      if (res.data.products) {
        setProductsList(res.data.products)
      }
    } catch (err) {
      toast.error('Gagal memuat inventori akun digital')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [page, filters.status, filters.product_name])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchInventory()
  }

  const openAdd = () => {
    setProductName('')
    setDigiflazzSku('')
    setEmail('')
    setPassword('')
    setBulkData('')
    setUploadMode('single')
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!productName.trim()) {
      toast.error('Nama produk wajib diisi')
      return
    }

    setSaveLoading(true)
    try {
      const payload = {
        product_name: productName,
        digiflazz_sku: digiflazzSku || null,
        mode: uploadMode
      }

      if (uploadMode === 'single') {
        if (!email.trim() || !password.trim()) {
          toast.error('Email dan password wajib diisi')
          setSaveLoading(false)
          return
        }
        payload.email = email
        payload.password = password
      } else {
        if (!bulkData.trim()) {
          toast.error('Data bulk wajib diisi')
          setSaveLoading(false)
          return
        }
        payload.bulk_data = bulkData
      }

      await adminApi.inventoryCreate(payload)
      toast.success('Stok akun berhasil ditambahkan!')
      setModalOpen(false)
      fetchInventory()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan stok')
    } finally {
      setSaveLoading(false)
    }
  }

  const openEdit = (account) => {
    setEditingId(account.id)
    setEditProductName(account.product_name)
    setEditEmail(account.email)
    setEditPassword(account.encrypted_password || '')
    setEditDigiflazzSku(account.digiflazz_sku || '')
    setEditStatus(account.status)
    setEditModalOpen(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editProductName.trim() || !editEmail.trim()) {
      toast.error('Nama produk dan email wajib diisi')
      return
    }

    setSaveLoading(true)
    try {
      const payload = {
        product_name: editProductName,
        email: editEmail,
        digiflazz_sku: editDigiflazzSku || null,
        status: editStatus
      }

      if (editPassword.trim()) {
        payload.password = editPassword
      }

      await adminApi.inventoryUpdate(editingId, payload)
      toast.success('Stok akun berhasil diperbarui!')
      setEditModalOpen(false)
      fetchInventory()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui stok')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus persediaan stok akun ini?')) return
    try {
      await adminApi.inventoryDelete(id)
      toast.success('Stok akun berhasil dihapus!')
      fetchInventory()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus stok')
    }
  }

  const toggleReveal = (id) => {
    setRevealedCreds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const maskEmail = (emailStr) => {
    if (!emailStr) return ''
    const parts = emailStr.split('@')
    if (parts.length < 2) return emailStr
    const name = parts[0]
    const domain = parts[1]
    if (name.length <= 2) return `*@${domain}`
    return `${name[0]}***${name[name.length - 1]}@${domain}`
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white text-glow">Stok Akun</h1>
          <p className="font-body-md text-body-md text-text-muted mt-2">Manage and monitor your digital account credentials for automatic instant deliveries.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={openAdd} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 glow-button border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
            <Plus size={18} /> Add New Stock
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="glass rounded-2xl p-6 relative overflow-hidden group border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database size={64} className="text-secondary" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-glow/10 flex items-center justify-center text-cyan-glow border border-cyan-glow/20">
              <Database size={20} />
            </div>
            <h3 className="text-sm font-semibold text-text-muted">Total Stock Available</h3>
          </div>
          <div className="text-3xl font-bold font-display text-white">{stats.available_stock} <span className="text-xs text-text-muted font-normal font-sans">available</span></div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp size={14} />
            <span>Health: Excellent ({stats.total_stock} total uploaded)</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass rounded-2xl p-6 relative overflow-hidden group border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText size={64} className="text-electric-blue" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center text-electric-blue border border-electric-blue/20">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-semibold text-text-muted">Accounts Sold Today</h3>
          </div>
          <div className="text-3xl font-bold font-display text-white">{stats.sold_today} <span className="text-xs text-text-muted font-normal font-sans">units</span></div>
          <div className="text-xs text-text-muted mt-2">
            Instant digital delivery completes in seconds
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass rounded-2xl p-6 relative overflow-hidden group border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle size={64} className="text-amber-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-sm font-semibold text-text-muted">Accounts On Hold</h3>
          </div>
          <div className="text-3xl font-bold font-display text-white">{stats.hold_stock} <span className="text-xs text-text-muted font-normal font-sans">on hold</span></div>
          <div className="text-xs text-amber-400 mt-2 flex items-center gap-1">
            <span>Pending user checkout validation</span>
          </div>
        </div>
      </div>

      {/* Table Controls / Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02] p-5 rounded-2xl border border-white/5 backdrop-blur-md">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-1/3 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow/30 transition-all placeholder:text-text-muted" 
            placeholder="Search accounts, emails, SKUs..." 
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </form>
        <div className="w-full md:w-auto flex flex-wrap gap-3">
          <select 
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-glow cursor-pointer min-w-[160px]"
            value={filters.product_name}
            onChange={(e) => setFilters({ ...filters, product_name: e.target.value, search: '' })}
          >
            <option className="bg-surface-container" value="">All Products</option>
            {productsList.map((prod, idx) => (
              <option className="bg-surface-container" key={idx} value={prod}>{prod}</option>
            ))}
          </select>
          
          <select 
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-glow cursor-pointer min-w-[140px]"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option className="bg-surface-container" value="">Status: All</option>
            <option className="bg-surface-container" value="available">Available</option>
            <option className="bg-surface-container" value="sold">Sold</option>
            <option className="bg-surface-container" value="hold">On Hold</option>
          </select>

          <button onClick={fetchInventory} className="btn-secondary py-2.5 px-4 rounded-xl text-sm flex items-center gap-2">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Accounts List Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-8 space-y-3">
            <div className="skeleton h-12 w-full rounded-lg" />
            <div className="skeleton h-12 w-full rounded-lg" />
            <div className="skeleton h-12 w-full rounded-lg" />
          </div>
        ) : inventory.length === 0 ? (
          <div className="p-16 text-center text-text-muted flex flex-col items-center gap-4">
            <Database size={40} className="text-white/10" />
            <p className="text-sm">Tidak ada persediaan stok akun digital.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Credentials (Masked)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">SKU Mapping</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Date Added</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {inventory.map((item) => {
                  const isRevealed = revealedCreds[item.id];
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-cyan-glow shrink-0">
                            <PlayCircle size={16} />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{item.product_name}</div>
                            <div className="text-[11px] text-text-muted mt-0.5">ID: #{item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 font-mono text-white text-xs">
                          {isRevealed ? (
                            <div className="bg-white/5 p-2 rounded border border-white/5 flex flex-col gap-0.5">
                              <div><span className="text-text-muted mr-1">EMAIL:</span>{item.email}</div>
                              <div><span className="text-text-muted mr-1">PASS:</span>{item.encrypted_password}</div>
                            </div>
                          ) : (
                            <div className="bg-white/[0.01] px-2 py-1 rounded border border-white/5 italic text-text-muted">
                              {maskEmail(item.email)} | ••••••••
                            </div>
                          )}
                          <button onClick={() => toggleReveal(item.id)} className="text-text-muted hover:text-cyan-glow transition-colors" title={isRevealed ? "Hide" : "Reveal"}>
                            {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-text-secondary">
                        {item.digiflazz_sku || <span className="italic text-text-muted">Direct Upload</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          item.status === 'available' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                            : item.status === 'sold'
                            ? 'bg-white/5 text-text-muted border-white/10'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        }`}>
                          {item.status === 'available' ? 'Available' : item.status === 'sold' ? 'Sold' : 'On Hold'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-muted text-xs">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-muted hover:text-cyan-glow transition-colors" title="Edit">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-text-muted hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between mt-auto">
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 shadow-2xl rounded-2xl flex flex-col max-h-[90vh] overflow-hidden text-white">
            <form onSubmit={handleSave} className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                <div>
                  <h3 className="text-lg font-bold font-display text-white">Upload Stok Akun Digital</h3>
                  <p className="text-xs text-text-muted mt-1">Impor stok akun digital secara single atau bulk.</p>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Nama Produk Layanan</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mobile Legends Diamond 1000, Genshin Impact Primogems"
                    className="input-dark text-sm py-2"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Digiflazz SKU Mapping (Opsional)</label>
                  <input
                    type="text"
                    placeholder="e.g. MLBB-1000, GENSHIN-80"
                    className="input-dark text-sm py-2"
                    value={digiflazzSku}
                    onChange={(e) => setDigiflazzSku(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Mode Pengunggahan</label>
                  <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${uploadMode === 'single' ? 'bg-cyan-glow/20 text-cyan-glow border border-cyan-glow/20' : 'text-text-muted hover:text-white'}`}
                      onClick={() => setUploadMode('single')}
                    >
                      Single Account
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${uploadMode === 'bulk' ? 'bg-cyan-glow/20 text-cyan-glow border border-cyan-glow/20' : 'text-text-muted hover:text-white'}`}
                      onClick={() => setUploadMode('bulk')}
                    >
                      Bulk Copy-Paste
                    </button>
                  </div>
                </div>

                {uploadMode === 'single' ? (
                  <div className="space-y-4 bg-white/[0.01] p-4 rounded-xl border border-white/5">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Email Kredensial</label>
                      <input
                        type="text"
                        placeholder="buyer@gmail.com"
                        className="input-dark text-sm py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required={uploadMode === 'single'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Kata Sandi (Plain Text)</label>
                      <input
                        type="text"
                        placeholder="sandiRahasia123!"
                        className="input-dark text-sm py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={uploadMode === 'single'}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Data Bulk Akun</label>
                      <textarea
                        rows={6}
                        placeholder="email1@gmail.com|sandi123&#10;email2@gmail.com|sandi456|SKU-OPTIONAL"
                        className="input-dark text-xs py-2 font-mono"
                        value={bulkData}
                        onChange={(e) => setBulkData(e.target.value)}
                        required={uploadMode === 'bulk'}
                      />
                    </div>
                    <div className="flex gap-2 items-start p-3 bg-white/5 rounded-xl text-[11px] text-text-muted leading-relaxed border border-white/5">
                      <UploadCloud size={16} className="shrink-0 text-cyan-glow" />
                      <span>Format per baris: <strong>email|password</strong> atau <strong>email|password|sku</strong>. Gunakan pemisah tanda vertikal pipe (|). Baris kosong akan dilewati.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 bg-slate-900/50 flex gap-3 shrink-0">
                <button type="button" onClick={() => setModalOpen(false)} className="w-full py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors flex-1 text-sm">
                  Batal
                </button>
                <button type="submit" disabled={saveLoading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all flex items-center justify-center gap-2 flex-1 text-sm">
                  {saveLoading ? 'Menyimpan...' : 'Upload & Enkrip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 shadow-2xl rounded-2xl flex flex-col max-h-[90vh] overflow-hidden text-white">
            <form onSubmit={handleUpdate} className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                <div>
                  <h3 className="text-lg font-bold font-display text-white">Edit Stok Akun #{editingId}</h3>
                  <p className="text-xs text-text-muted mt-1">Perbarui kredensial atau status persediaan digital.</p>
                </div>
                <button type="button" onClick={() => setEditModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Nama Produk Layanan</label>
                  <input
                    type="text"
                    required
                    className="input-dark text-sm py-2"
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Digiflazz SKU Mapping</label>
                  <input
                    type="text"
                    className="input-dark text-sm py-2"
                    value={editDigiflazzSku}
                    onChange={(e) => setEditDigiflazzSku(e.target.value)}
                  />
                </div>

                <div className="bg-white/[0.01] p-4 rounded-xl border border-white/5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Email Kredensial</label>
                    <input
                      type="text"
                      required
                      className="input-dark text-sm py-2"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Kata Sandi Baru (Kosongkan jika tidak diubah)</label>
                    <input
                      type="text"
                      placeholder="Masukkan password baru untuk overwrite..."
                      className="input-dark text-sm py-2"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Status Persediaan</label>
                  <select
                    className="input-dark text-sm py-2"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="hold">On Hold</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 bg-slate-900/50 flex gap-3 shrink-0">
                <button type="button" onClick={() => setEditModalOpen(false)} className="w-full py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors flex-1 text-sm">
                  Batal
                </button>
                <button type="submit" disabled={saveLoading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all flex items-center justify-center gap-2 flex-1 text-sm">
                  {saveLoading ? 'Menyimpan...' : 'Perbarui Kredensial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
