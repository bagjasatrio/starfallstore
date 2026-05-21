import React, { useEffect, useState } from 'react'
import { 
  User, 
  Search, 
  RefreshCw, 
  DollarSign, 
  Plus, 
  Minus, 
  Ban, 
  CheckCircle,
  Key,
  X,
  Edit2,
  ShieldAlert,
  UserPlus
} from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminUserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_admin: 0,
    total_buyer: 0
  })

  // List filters & paging
  const [filters, setFilters] = useState({ search: '', status: '', role: '' })
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'buyer'
  })
  const [updateLoading, setUpdateLoading] = useState(false)

  // Adjust Balance State
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustLoading, setAdjustLoading] = useState(false)

  // Reset Password State
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', username: '', email: '', password: '', role: 'buyer' })
  const [createLoading, setCreateLoading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await adminApi.usersList({ ...filters, page })
      setUsers(res.data.data)
      setStats(res.data.stats)
      setMeta(res.data.meta)
    } catch (err) {
      toast.error('Gagal memuat daftar user')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const res = await adminApi.userCreate(createForm)
      toast.success(res.data.message)
      setIsCreateModalOpen(false)
      setCreateForm({ name: '', username: '', email: '', password: '', role: 'buyer' })
      fetchUsers()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).flat().forEach(msg => toast.error(msg))
      } else {
        toast.error(err.response?.data?.message || 'Gagal membuat akun')
      }
    } finally {
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, filters.status, filters.role])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    })
    setAdjustAmount('')
    setNewPassword('')
    setIsModalOpen(true)
  }

  const closeEditModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    setUpdateLoading(true)
    try {
      const res = await adminApi.userUpdate(selectedUser.id, formData)
      toast.success(res.data.message)
      fetchUsers()
      closeEditModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui user')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleAdjustBalance = async (action) => {
    if (!selectedUser) return
    const amountNum = parseFloat(adjustAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Masukkan nominal jumlah saldo yang valid')
      return
    }

    setAdjustLoading(true)
    try {
      const res = await adminApi.adjustBalance(selectedUser.id, {
        action,
        amount: amountNum,
        notes: 'Penyesuaian oleh admin'
      })
      toast.success(res.data.message)
      setAdjustAmount('')
      fetchUsers()
      
      // Update selected user balance to reflect in modal
      setSelectedUser(prev => ({
        ...prev,
        wallet_balance: res.data.wallet_balance
      }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah saldo')
    } finally {
      setAdjustLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedUser) return
    const currentStatus = selectedUser.account_status
    const targetStatus = currentStatus === 'active' ? 'suspended' : 'active'
    
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status akun menjadi ${targetStatus.toUpperCase()}?`)) return

    try {
      const res = await adminApi.toggleUserStatus(selectedUser.id, targetStatus)
      toast.success(res.data.message)
      
      // Update selected user to reflect in modal
      setSelectedUser(prev => ({ ...prev, account_status: targetStatus }))
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status akun')
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser) return
    if (newPassword.length < 8) {
      toast.error('Password minimal 8 karakter')
      return
    }

    setResetLoading(true)
    try {
      const res = await adminApi.resetUserPassword(selectedUser.id, newPassword)
      toast.success(res.data.message)
      setNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mereset password')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full items-start">
      {/* Header & Filters */}
      <section className="flex flex-col gap-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-white text-glow">Manajemen Pengguna</h1>
            <p className="font-body-md text-body-md text-text-muted mt-2">Atur peran, status, dan data customer.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto flex-wrap">
            <button
              onClick={() => { setIsCreateModalOpen(true); setCreateForm({ name: '', username: '', email: '', password: '', role: 'buyer' }) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-95"
            >
              <UserPlus size={16} /> Tambah Pengguna
            </button>
            <form onSubmit={handleSearchSubmit} className="relative flex-1 md:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow/30 transition-all w-full md:w-64 backdrop-blur-md" 
                placeholder="Cari nama, email, username..." 
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </form>
            <select
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow/30"
              value={filters.role}
              onChange={(e) => { setFilters({ ...filters, role: e.target.value }); setPage(1); }}
            >
              <option value="" className="bg-slate-900 text-white">Semua Role</option>
              <option value="admin" className="bg-slate-900 text-white">Admin</option>
              <option value="buyer" className="bg-slate-900 text-white">Buyer</option>
            </select>
            <button onClick={fetchUsers} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-center text-white transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-6 border border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-blue-900/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all duration-500"></div>
            <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider relative z-10">Total Admin</div>
            <div className="text-4xl font-bold font-display text-white mt-2 relative z-10">{stats.total_admin}</div>
          </div>
          <div className="glass rounded-xl p-6 border border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-cyan-900/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-all duration-500"></div>
            <div className="text-xs text-cyan-200 font-semibold uppercase tracking-wider relative z-10">Total Buyer</div>
            <div className="text-4xl font-bold font-display text-white mt-2 relative z-10">{stats.total_buyer}</div>
          </div>
        </div>

        {/* User Table */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-text-muted uppercase tracking-wider">
                  <th className="p-4 w-16">ID</th>
                  <th className="p-4">Profile</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Wallet Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 space-y-3">
                      <div className="skeleton h-10 w-full rounded-lg" />
                      <div className="skeleton h-10 w-full rounded-lg" />
                      <div className="skeleton h-10 w-full rounded-lg" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-text-muted">
                      <User size={32} className="mx-auto text-white/10 mb-2" />
                      <p>Tidak ada pengguna ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 text-text-muted font-mono text-xs">#{user.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 border border-white/10 flex items-center justify-center text-white shrink-0 overflow-hidden font-bold shadow-inner">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{user.name}</div>
                            <div className="text-xs text-text-muted font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                            <ShieldAlert size={10} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                            <User size={10} />
                            Buyer
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-semibold">
                        {user.role === 'buyer' ? (
                          <span className="text-cyan-glow text-shadow-glow">Rp {parseFloat(user.wallet_balance).toLocaleString('id-ID')}</span>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          user.account_status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.account_status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                          {user.account_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="text-cyan-glow hover:text-white transition-colors text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-glow/20 border border-white/5 inline-flex items-center gap-1"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
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
      </section>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 backdrop-blur-xl p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 shadow-[0_0_40px_rgba(6,182,212,0.12)] rounded-2xl overflow-hidden text-white">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <UserPlus size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white">Tambah Pengguna</h3>
                  <p className="text-xs text-text-muted mt-0.5">Buat akun buyer atau admin baru secara manual.</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-text-muted hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form id="create-user-form" onSubmit={handleCreateUser} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Nama Lengkap</label>
                <input
                  type="text" required
                  className="input-dark w-full"
                  placeholder="e.g. Budi Santoso"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text" required
                  className="input-dark w-full"
                  placeholder="e.g. budisantoso"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email" required
                  className="input-dark w-full"
                  placeholder="user@email.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password" required minLength={8}
                  className="input-dark w-full"
                  placeholder="Min. 8 karakter"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Role Akun</label>
                <div className="relative">
                  <select
                    className="input-dark w-full appearance-none pr-10"
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  >
                    <option value="buyer">Buyer — Customer / Pembeli</option>
                    <option value="admin">Admin — Akses Dashboard Penuh</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <p className={`text-[10px] mt-1.5 font-medium ${ createForm.role === 'admin' ? 'text-blue-400' : 'text-cyan-400' }`}>
                  {createForm.role === 'admin' ? '⚠️ Akun ini akan memiliki akses penuh ke admin panel.' : '✓ Akun buyer standar dengan akses toko.'}
                </p>
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-slate-900/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors text-sm"
              >
                Batalkan
              </button>
              <button
                type="submit"
                form="create-user-form"
                disabled={createLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {createLoading ? (
                  <><RefreshCw size={14} className="animate-spin" /> Menyimpan...</>
                ) : (
                  <><UserPlus size={14} /> Simpan Akun</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centralized Edit Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 backdrop-blur-xl p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 shadow-[0_0_40px_rgba(6,182,212,0.1)] rounded-2xl flex flex-col overflow-hidden text-white max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/10 p-1 shrink-0 overflow-hidden bg-gradient-to-r from-slate-800 to-slate-700">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-white flex items-center justify-center h-full">
                      {selectedUser.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                    Edit User
                    {selectedUser.account_status === 'active' ? (
                      <CheckCircle size={16} className="text-emerald-400" />
                    ) : (
                      <ShieldAlert size={16} className="text-red-400" />
                    )}
                  </h3>
                  <p className="text-sm text-text-muted font-mono mt-1">ID: #{selectedUser.id}</p>
                </div>
              </div>
              <button type="button" onClick={closeEditModal} className="text-text-muted hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Basic Info & Role */}
              <div className="flex flex-col gap-6">
                <form id="update-user-form" onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      className="input-dark w-full"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Username</label>
                    <input
                      type="text"
                      required
                      className="input-dark w-full"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      className="input-dark w-full"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Role</label>
                    <div className="relative">
                      <select
                        className="input-dark w-full appearance-none pr-10"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="admin">Admin</option>
                        <option value="buyer">Buyer</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-muted">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Account Status</h3>
                  <button 
                    type="button"
                    onClick={handleToggleStatus}
                    className={`w-full py-2.5 rounded-xl border font-semibold flex items-center justify-center gap-2 text-sm transition-all ${
                      selectedUser.account_status === 'active'
                        ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    <Ban size={16} /> {selectedUser.account_status === 'active' ? 'Suspend Account' : 'Activate Account'}
                  </button>
                </div>
              </div>

              {/* Right Column: Special Actions */}
              <div className="flex flex-col gap-6">
                
                {/* Adjust Wallet Balance (Buyers Only) */}
                {selectedUser.role === 'buyer' && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full"></div>
                    <div className="flex justify-between items-center mb-4 relative z-10">
                      <h3 className="text-xs font-semibold text-cyan-glow uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign size={14} /> Wallet Balance
                      </h3>
                      <span className="font-mono font-bold text-white bg-black/20 px-3 py-1 rounded-full text-sm">
                        Rp {parseFloat(selectedUser.wallet_balance).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="space-y-3 relative z-10">
                      <input 
                        className="input-dark w-full" 
                        placeholder="Nominal Amount (Rp)" 
                        type="number"
                        min="1"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => handleAdjustBalance('topup')}
                          disabled={adjustLoading}
                          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
                        >
                          <Plus size={14} /> Top Up
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleAdjustBalance('deduct')}
                          disabled={adjustLoading}
                          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all"
                        >
                          <Minus size={14} /> Deduct
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset Password */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-4">
                    <Key size={14} /> Reset Password
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="New password (min 8 char)"
                      className="input-dark w-full text-sm"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={handleResetPassword}
                      disabled={resetLoading}
                      className="w-full py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors flex justify-center items-center gap-2"
                    >
                      {resetLoading ? 'Processing...' : 'Update Password'}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/5 bg-slate-900/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={closeEditModal} 
                className="px-6 py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="update-user-form"
                disabled={updateLoading} 
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 text-sm"
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
