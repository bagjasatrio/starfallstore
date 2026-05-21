import React, { useEffect, useState } from 'react'
import { 
  User, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  DollarSign, 
  Plus, 
  Minus, 
  Lock, 
  Ban, 
  CheckCircle,
  Clock,
  Key,
  X
} from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    suspended_users: 0,
    total_balance: 0
  })

  // List filters & paging
  const [filters, setFilters] = useState({ search: '', status: '', role: '' })
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  // Selected user for details drawer
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetail, setUserDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Adjust Balance Form
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustNotes, setAdjustNotes] = useState('')
  const [adjustLoading, setAdjustLoading] = useState(false)

  // Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await adminApi.usersList({ ...filters, page })
      setUsers(res.data.data)
      setStats(res.data.stats)
      setMeta(res.data.meta)
      
      // Auto-select first user if none selected
      if (res.data.data.length > 0 && !selectedUser) {
        handleSelectUser(res.data.data[0])
      }
    } catch (err) {
      toast.error('Gagal memuat daftar user')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = async (user) => {
    setSelectedUser(user)
    setDetailLoading(true)
    try {
      const res = await adminApi.userShow(user.id)
      setUserDetail(res.data)
    } catch (err) {
      toast.error('Gagal memuat detail user')
    } finally {
      setDetailLoading(false)
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
        notes: adjustNotes || 'Penyesuaian saldo admin'
      })
      toast.success(res.data.message)
      setAdjustAmount('')
      setAdjustNotes('')
      // Refresh details
      handleSelectUser(selectedUser)
      // Refresh listing
      fetchUsers()
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
      
      // Update local states
      const updatedUser = { ...selectedUser, account_status: targetStatus }
      setSelectedUser(updatedUser)
      handleSelectUser(updatedUser)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status akun')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    if (newPassword.length < 8) {
      toast.error('Password minimal 8 karakter')
      return
    }

    setResetLoading(true)
    try {
      const res = await adminApi.resetUserPassword(selectedUser.id, newPassword)
      toast.success(res.data.message)
      setResetModalOpen(false)
      setNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mereset password')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-start">
      {/* Left: User list & Filters */}
      <section className="lg:col-span-2 flex flex-col gap-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-white text-glow">User Management</h1>
            <p className="font-body-md text-body-md text-text-muted mt-2">Manage customer balances, view activities, and adjust security states.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 md:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow/30 transition-all w-full md:w-64 backdrop-blur-md" 
                placeholder="Search name, email, phone..." 
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </form>
            <button onClick={fetchUsers} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-center text-white transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Bento stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 border border-white/5 bg-gradient-to-br from-white/[0.02] to-white/[0.01]">
            <div className="text-xs text-text-muted font-semibold uppercase tracking-wider">Total Customers</div>
            <div className="text-2xl font-bold font-display text-white mt-1">{stats.total_users}</div>
          </div>
          <div className="glass rounded-xl p-4 border border-white/5 bg-gradient-to-br from-white/[0.02] to-white/[0.01]">
            <div className="text-xs text-text-muted font-semibold uppercase tracking-wider">Active Status</div>
            <div className="text-2xl font-bold font-display text-emerald-400 mt-1">{stats.active_users}</div>
          </div>
          <div className="glass rounded-xl p-4 border border-white/5 bg-gradient-to-br from-white/[0.02] to-white/[0.01]">
            <div className="text-xs text-text-muted font-semibold uppercase tracking-wider">Suspended</div>
            <div className="text-2xl font-bold font-display text-red-400 mt-1">{stats.suspended_users}</div>
          </div>
          <div className="glass rounded-xl p-4 border border-white/5 bg-gradient-to-br from-white/[0.02] to-white/[0.01]">
            <div className="text-xs text-text-muted font-semibold uppercase tracking-wider">Total Balances</div>
            <div className="text-xl font-bold font-display text-cyan-glow mt-1 truncate">
              Rp {stats.total_balance.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* User Table container */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-text-muted uppercase tracking-wider">
                <th className="p-4">User Details</th>
                <th className="p-4">Wallet Balance</th>
                <th className="p-4 hidden sm:table-cell">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 space-y-3">
                    <div className="skeleton h-10 w-full rounded-lg" />
                    <div className="skeleton h-10 w-full rounded-lg" />
                    <div className="skeleton h-10 w-full rounded-lg" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-text-muted">
                    <User size={32} className="mx-auto text-white/10 mb-2" />
                    <p>Tidak ada customer terdaftar.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelected = selectedUser?.id === user.id
                  return (
                    <tr 
                      key={user.id} 
                      onClick={() => handleSelectUser(user)}
                      className={`hover:bg-white/[0.01] transition-colors cursor-pointer ${
                        isSelected ? 'bg-cyan-glow/5 border-l-4 border-cyan-glow' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 border border-white/10 flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
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
                      <td className="p-4 font-mono font-semibold text-white">
                        Rp {parseFloat(user.wallet_balance).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 hidden sm:table-cell">
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
                          onClick={(e) => { e.stopPropagation(); handleSelectUser(user) }}
                          className="text-cyan-glow hover:text-white transition-colors text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-glow/20 border border-white/5"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

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

      {/* Right sticky sidebar detail view */}
      <aside className="glass border border-white/5 rounded-2xl flex flex-col h-fit lg:sticky lg:top-8 w-full bg-gradient-to-br from-white/[0.02] to-white/[0.01]">
        {detailLoading ? (
          <div className="p-8 text-center space-y-4">
            <RefreshCw size={24} className="animate-spin text-cyan-glow mx-auto" />
            <p className="text-sm text-text-muted">Loading user profile...</p>
          </div>
        ) : userDetail ? (
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/5 flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-glow/50 p-1 shrink-0 overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.2)] bg-gradient-to-r from-blue-600 to-indigo-500">
                {userDetail.user.avatar_url ? (
                  <img src={userDetail.user.avatar_url} alt={userDetail.user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white flex items-center justify-center h-full">
                    {userDetail.user.name[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-display flex items-center justify-center gap-1.5">
                  {userDetail.user.name}
                  {userDetail.user.account_status === 'active' ? (
                    <CheckCircle size={14} className="text-emerald-400" />
                  ) : (
                    <ShieldAlert size={14} className="text-red-400" />
                  )}
                </h2>
                <p className="text-xs text-text-muted mt-0.5 font-mono">{userDetail.user.email}</p>
              </div>

              {/* Wallet Summary */}
              <div className="w-full flex justify-between px-4 py-3 bg-white/[0.02] rounded-xl border border-white/5 mt-3">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Wallet Balance</span>
                  <span className="text-2xl font-bold font-display text-cyan-glow flex items-center gap-1 mt-0.5">
                    Rp {parseFloat(userDetail.user.wallet_balance).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Balance Adjustment Utilities */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={13} /> Adjust Balance
                </h3>
                <div className="flex flex-col gap-2">
                  <input 
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow/30" 
                    placeholder="Nominal Amount (Rp)" 
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                  />
                  <input 
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow/30" 
                    placeholder="Notes (e.g. Refund, Bonus Top Up)" 
                    type="text"
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button 
                      onClick={() => handleAdjustBalance('topup')}
                      disabled={adjustLoading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10 active:scale-95 duration-200"
                    >
                      <Plus size={14} /> Add Funds
                    </button>
                    <button 
                      onClick={() => handleAdjustBalance('deduct')}
                      disabled={adjustLoading}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 duration-200"
                    >
                      <Minus size={14} /> Deduct Funds
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders activity */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex justify-between items-center">
                  Recent Orders ({userDetail.stats.order_count} Total)
                </h3>
                {userDetail.recent_orders.length === 0 ? (
                  <p className="text-xs text-text-muted italic bg-white/[0.01] p-3 rounded-xl border border-white/5">
                    No orders recorded for this user.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {userDetail.recent_orders.map((order) => (
                      <li key={order.id} className="bg-white/[0.01] rounded-xl p-3 border border-white/5 flex justify-between items-center text-xs hover:bg-white/5 transition-colors">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-white">{order.product?.name || 'Top Up Game'}</span>
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(order.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <span className="font-semibold text-white">
                          Rp {parseFloat(order.total_amount).toLocaleString('id-ID')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Security info card */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Security State</h3>
                <div className="bg-white/[0.01] rounded-xl p-3 border border-white/5 flex flex-col gap-2 text-xs text-text-secondary">
                  <div className="flex justify-between">
                    <span>Joined At</span>
                    <span className="text-white">
                      {new Date(userDetail.security_info.joined_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span>Email Verified</span>
                    <span className={userDetail.security_info.has_verified_email ? 'text-emerald-400' : 'text-amber-500'}>
                      {userDetail.security_info.has_verified_email ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span>Phone Number</span>
                    <span className="text-white">{userDetail.user.phone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions footer */}
            <div className="p-6 border-t border-white/5 flex flex-col gap-2 mt-auto">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => { setNewPassword(''); setResetModalOpen(true) }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs active:scale-95 duration-200"
                >
                  <Key size={13} /> Reset Pass
                </button>
                <button 
                  onClick={handleToggleStatus}
                  className={`border font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs active:scale-95 duration-200 ${
                    userDetail.user.account_status === 'active'
                      ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                  }`}
                >
                  <Ban size={13} /> {userDetail.user.account_status === 'active' ? 'Suspend' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center text-text-muted">
            <User size={36} className="mx-auto text-white/10 mb-2 animate-pulse" />
            <p className="text-sm">Pilih customer untuk melihat detail & administrasi.</p>
          </div>
        )}
      </aside>

      {/* Password reset Modal */}
      {resetModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 shadow-2xl rounded-2xl flex flex-col overflow-hidden text-white">
            <form onSubmit={handleResetPassword} className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                <div>
                  <h3 className="text-base font-bold font-display text-white">Reset User Password</h3>
                  <p className="text-xs text-text-muted mt-1">Ubah kata sandi untuk <strong>{selectedUser.name}</strong>.</p>
                </div>
                <button type="button" onClick={() => setResetModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Kata Sandi Baru</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Masukkan sandi baru (min 8 karakter)..."
                    className="input-dark text-sm py-2"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 bg-slate-900/50 flex gap-3 shrink-0">
                <button type="button" onClick={() => setResetModalOpen(false)} className="w-full py-2 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors flex-1 text-xs">
                  Batal
                </button>
                <button type="submit" disabled={resetLoading} className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg transition-all flex items-center justify-center gap-2 flex-1 text-xs">
                  {resetLoading ? 'Proses...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
