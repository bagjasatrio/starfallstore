import React, { useEffect, useState } from 'react'
import { Activity, ShieldAlert, Clock, RefreshCw, Server, User, Database } from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await adminApi.auditLogs({ page })
      setLogs(res.data.data)
      setMeta(res.data)
    } catch (err) {
      toast.error('Gagal memuat log sistem')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
            <ShieldAlert size={22} className="text-error" /> Security Audit Logs
          </h2>
          <p className="text-sm text-text-muted mt-1">Read-only real-time stream operasi staff dan admin.</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
          <RefreshCw size={15} /> Refresh Data
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-lg" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
            <Activity size={32} className="text-white/20" />
            <p>Belum ada rekaman audit log.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Timestamp</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Admin/Staff</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Action</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Target & Meta</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-text-secondary text-sm">
                        <Clock size={14} className="text-text-muted" />
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-electric-blue/20 flex items-center justify-center shrink-0">
                          <User size={12} className="text-electric-blue" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{log.admin?.name || 'System'}</p>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">{log.admin?.role || 'SYSTEM'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-mono rounded-md bg-purple-accent/15 text-purple-accent border border-purple-accent/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-mono text-text-secondary space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Database size={12} className="text-cyan-glow" /> Table: {log.target_table || 'N/A'}
                        </div>
                        {log.metadata_json && (
                          <div className="bg-white/5 p-2 rounded border border-white/5 mt-1 overflow-x-auto max-w-xs">
                            <pre className="text-[10px] leading-relaxed text-text-muted">
                              {JSON.stringify(log.metadata_json, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                        <Server size={14} /> {log.ip_address || '127.0.0.1'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5 bg-white/[0.01]">
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
    </div>
  )
}
