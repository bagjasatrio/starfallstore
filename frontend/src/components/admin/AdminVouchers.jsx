import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'fixed',
    discount_value: '',
    max_uses: '',
    valid_until: '',
    is_active: true
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchVouchers = async () => {
    try {
      const res = await adminApi.vouchersList()
      setVouchers(res.data.vouchers)
    } catch (err) {
      toast.error('Gagal mengambil data voucher')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_until: formData.valid_until ? formData.valid_until : null,
      }
      
      if (editingId) {
        await adminApi.voucherUpdate(editingId, payload)
        toast.success('Voucher berhasil diperbarui')
      } else {
        await adminApi.voucherCreate(payload)
        toast.success('Voucher berhasil dibuat')
      }
      setShowModal(false)
      fetchVouchers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan voucher')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus voucher ini?')) return
    try {
      await adminApi.voucherDelete(id)
      toast.success('Voucher dihapus')
      fetchVouchers()
    } catch (err) {
      toast.error('Gagal menghapus voucher')
    }
  }

  const openAddModal = () => {
    setEditingId(null)
    setFormData({ code: '', discount_type: 'fixed', discount_value: '', max_uses: '', valid_until: '', is_active: true })
    setShowModal(true)
  }

  const openEditModal = (v) => {
    setEditingId(v.id)
    setFormData({
      code: v.code,
      discount_type: v.discount_type,
      discount_value: v.discount_value,
      max_uses: v.max_uses || '',
      valid_until: v.valid_until ? v.valid_until.substring(0, 16) : '',
      is_active: v.is_active
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Manajemen Voucher</h1>
          <p className="text-sm text-text-muted mt-1">Kelola kode promo dan diskon untuk pelanggan.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary py-2 px-4 text-sm">
          <Plus size={16} /> Tambah Voucher
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Kode</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Tipe</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nilai</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Kuota</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Berlaku Sampai</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-electric-blue" /></td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted">Belum ada voucher.</td>
                </tr>
              ) : vouchers.map(v => (
                <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-electric-blue">{v.code}</td>
                  <td className="p-4 text-sm text-text-primary capitalize">{v.discount_type}</td>
                  <td className="p-4 text-sm text-text-primary">
                    {v.discount_type === 'percentage' ? `${parseFloat(v.discount_value)}%` : `Rp ${new Intl.NumberFormat('id-ID').format(v.discount_value)}`}
                  </td>
                  <td className="p-4 text-sm text-text-muted">
                    {v.uses_count} / {v.max_uses || '∞'}
                  </td>
                  <td className="p-4 text-sm text-text-muted">
                    {v.valid_until ? new Date(v.valid_until).toLocaleString('id-ID') : 'Tanpa Batas'}
                  </td>
                  <td className="p-4">
                    {v.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error/10 text-error text-xs font-medium border border-error/20">
                        <XCircle size={12} /> Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEditModal(v)} className="p-2 text-text-muted hover:text-electric-blue transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="p-2 text-text-muted hover:text-error transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass-modal w-full max-w-md animate-scale-in p-6">
              <h3 className="font-display font-bold text-xl text-text-primary mb-4">
                {editingId ? 'Edit Voucher' : 'Tambah Voucher'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Kode Voucher</label>
                  <input type="text" className="input-dark" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Tipe Diskon</label>
                    <select className="input-dark" value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})}>
                      <option value="fixed">Nominal (Rp)</option>
                      <option value="percentage">Persentase (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nilai Diskon</label>
                    <input type="number" step="0.01" className="input-dark" required value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Batas Kuota (Opsional)</label>
                    <input type="number" className="input-dark" value={formData.max_uses} onChange={e => setFormData({...formData, max_uses: e.target.value})} placeholder="Kosongkan jika unlimited" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Berlaku Sampai (Opsional)</label>
                    <input type="datetime-local" className="input-dark" value={formData.valid_until} onChange={e => setFormData({...formData, valid_until: e.target.value})} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="rounded border-white/20 bg-dark-navy text-electric-blue focus:ring-electric-blue focus:ring-offset-dark-navy" />
                  <label htmlFor="is_active" className="text-sm text-text-secondary cursor-pointer">Voucher Aktif</label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
