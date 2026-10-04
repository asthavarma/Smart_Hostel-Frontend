import React, { useEffect, useState } from 'react';
import { History, Search, Shield, Filter, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface AuditLog {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: {
    name: string;
    role: string;
    email: string;
  };
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || log.action.toUpperCase().includes(actionFilter);

    return matchesSearch && matchesAction;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Super Admin</span>;
      case 'HOSTEL_MANAGER':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Manager</span>;
      case 'WARDEN':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Warden</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Student</span>;
    }
  };

  return (
    <div className="space-y-6 page-fade">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-slate-900 text-white p-8 rounded-2xl border border-border shadow-md flex justify-between items-center min-h-[120px]">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-extrabold tracking-tight">System Audit & Security Logs</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">Real-time immutable audit trail for administrative actions and data access events.</p>
        </div>
        <button
          onClick={fetchLogs}
          className="relative z-10 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl flex items-center gap-2 hover:bg-primary/95 shadow-md"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by user, action, email, or metadata..."
            className="w-full bg-secondary/30 border border-border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-secondary/30 border border-border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="LOGIN">Logins</option>
            <option value="CREATE">Create Events</option>
            <option value="UPDATE">Update Events</option>
            <option value="DELETE">Delete Events</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium">Fetching system audit trail...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold">No audit logs matched your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/20 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">{log.user.name}</div>
                      <div className="text-[10px] text-muted-foreground">{log.user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(log.user.role)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-primary">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground/80 font-medium">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
