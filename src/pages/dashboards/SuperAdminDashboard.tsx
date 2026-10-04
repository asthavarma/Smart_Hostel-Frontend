import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Users, Home, ShieldAlert, CreditCard, ChevronRight, Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

interface GeneralStats {
  totalStudents: number;
  totalRooms: number;
  totalCapacity: number;
  occupiedBeds: number;
  availableBeds: number;
  pendingComplaints: number;
  activeVisitors: number;
  attendanceRate: number;
  finance: {
    collected: number;
    outstanding: number;
  };
}

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/stats');
      setStats(res.data);
    } catch (err: any) {
      console.error('Error fetching analytics stats', err);
      setError(err.response?.data?.error || 'Failed to connect to analytics service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground font-medium">Loading live dashboard telemetry...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 bg-card border border-border rounded-2xl p-8 max-w-md mx-auto my-12 text-center">
        <div className="p-3 bg-red-500/10 text-red-500 rounded-full">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Dashboard Unavailable</h3>
          <p className="text-xs text-muted-foreground mt-1">{error || 'Could not fetch live system metrics.'}</p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl flex items-center gap-2 hover:bg-primary/95 shadow-md"
        >
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  // Finance chart data
  const financeData = [
    { name: 'Collections Ledger', Collected: stats.finance.collected, Outstanding: stats.finance.outstanding }
  ];

  // Room type occupancy ratio
  const occupancyRate = stats.totalCapacity > 0 ? (stats.occupiedBeds / stats.totalCapacity) * 100 : 0;

  const roomDistribution = [
    { name: 'Occupied Beds', value: stats.occupiedBeds },
    { name: 'Available Beds', value: stats.availableBeds }
  ];

  const COLORS = ['#6366f1', '#64748b'];

  return (
    <div className="space-y-8 page-fade">
      {/* Greeting Header with image */}
      <div className="relative overflow-hidden bg-slate-900 text-white p-8 rounded-2xl border border-border shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 min-h-[140px]">
        <img 
          src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80" 
          alt="Super Admin Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent" />
        
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome back, Super Admin</h1>
          <p className="text-sm text-slate-300 mt-1">Hostel operations, room capacity models, and financial ledgers.</p>
        </div>
        <div className="relative z-10 bg-primary/20 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 border border-primary/30 backdrop-blur-md">
          <Activity className="w-4 h-4 text-primary-foreground animate-pulse" /> Live Telemetry Active
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Students</span>
              <h3 className="text-3xl font-extrabold tracking-tight">{stats.totalStudents}</h3>
            </div>
            <div className="bg-indigo-500/10 text-indigo-500 p-3 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <Link to="/students" className="mt-4 inline-flex items-center text-xs text-indigo-500 hover:text-indigo-600 font-semibold gap-1">
            <span>Student registry logs</span> <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Room Occupancy Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bed Occupancy</span>
              <h3 className="text-3xl font-extrabold tracking-tight">{Math.round(occupancyRate)}%</h3>
            </div>
            <div className="bg-primary/10 text-primary p-3 rounded-xl">
              <Home className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 font-medium">
            {stats.occupiedBeds} of {stats.totalCapacity} beds currently allocated.
          </p>
        </div>

        {/* Pending Complaints Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Complaints Active</span>
              <h3 className="text-3xl font-extrabold tracking-tight text-rose-500">{stats.pendingComplaints}</h3>
            </div>
            <div className="bg-rose-500/10 text-rose-500 p-3 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <Link to="/complaints" className="mt-4 inline-flex items-center text-xs text-rose-500 hover:text-rose-600 font-semibold gap-1">
            <span>Review urgent tickets</span> <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Ledger Collections Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collected Dues</span>
              <h3 className="text-3xl font-extrabold tracking-tight text-emerald-500">₹{stats.finance.collected.toLocaleString('en-IN')}</h3>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 font-medium">
            Outstanding: <span className="text-red-500 font-semibold">₹{stats.finance.outstanding.toLocaleString('en-IN')}</span>
          </p>
        </div>
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ledger summary */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm lg:col-span-2">
          <h3 className="font-bold text-base text-foreground mb-4">Financial Ledger Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Legend />
                <Bar dataKey="Collected" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Outstanding" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Allocations Pie */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground mb-4">Hostel Bed Allocations</h3>
            <div className="h-60 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roomDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-2 pt-4 border-t border-border/60">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="flex items-center gap-2 text-indigo-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Occupied beds
              </span>
              <span>{stats.occupiedBeds} Beds</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Empty beds
              </span>
              <span>{stats.availableBeds} Beds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
