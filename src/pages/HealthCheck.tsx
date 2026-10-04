import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, XCircle, RefreshCw, Server, Laptop, ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../services/api';

interface BackendHealthData {
  status: string;
  services?: {
    api: string;
    database: string;
  };
  uptime?: string;
  environment?: string;
  timestamp?: string;
}

const HealthCheck: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState<number | null>(null);
  const [backendData, setBackendData] = useState<BackendHealthData | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  const fetchHealthStatus = async () => {
    setLoading(true);
    setBackendError(null);
    const start = performance.now();
    try {
      const res = await api.get('/health');
      const end = performance.now();
      setLatency(Math.round(end - start));
      setBackendData(res.data);
    } catch (err: any) {
      const end = performance.now();
      setLatency(Math.round(end - start));
      setBackendError(err.response?.data?.error || err.message || 'Unable to connect to backend service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-8 page-fade">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 text-primary p-3 rounded-2xl border border-primary/20">
              <Activity className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">System Health Telemetry</h1>
              <p className="text-xs text-slate-400">Live operational status monitor for Frontend & Backend</p>
            </div>
          </div>
          <button
            onClick={fetchHealthStatus}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all text-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Frontend Service Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                <Laptop className="w-4 h-4 text-indigo-400" />
                <span>Frontend Client</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>HEALTHY</span>
              </span>
            </div>
            
            <div className="space-y-2 text-xs text-slate-400 border-t border-slate-850 pt-4">
              <div className="flex justify-between">
                <span>Framework:</span>
                <span className="font-semibold text-slate-200">Vite + React (TypeScript)</span>
              </div>
              <div className="flex justify-between">
                <span>Client Status:</span>
                <span className="font-semibold text-emerald-400">ONLINE (200 OK)</span>
              </div>
              <div className="flex justify-between">
                <span>Build Environment:</span>
                <span className="font-semibold text-slate-200">{import.meta.env.MODE || 'production'}</span>
              </div>
            </div>
          </div>

          {/* Backend API Service Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                <Server className="w-4 h-4 text-primary" />
                <span>Backend API & DB</span>
              </div>
              {!loading && !backendError && backendData?.status === 'healthy' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>HEALTHY</span>
                </span>
              ) : !loading && backendError ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>UNHEALTHY</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
                  <span>CHECKING...</span>
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-400 border-t border-slate-850 pt-4">
              <div className="flex justify-between">
                <span>API Endpoint:</span>
                <span className="font-semibold text-slate-200">/api/health</span>
              </div>
              <div className="flex justify-between">
                <span>Database Connection:</span>
                <span className={`font-semibold ${backendData?.services?.database === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {backendData?.services?.database || (backendError ? 'DISCONNECTED' : '...')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Network Latency:</span>
                <span className="font-semibold text-slate-200">{latency !== null ? `${latency} ms` : '...'}</span>
              </div>
              <div className="flex justify-between">
                <span>Server Uptime:</span>
                <span className="font-semibold text-slate-200">{backendData?.uptime || '...'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Response Payload Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Live JSON Payload Response</span>
            <span>Timestamp: {backendData?.timestamp || new Date().toISOString()}</span>
          </div>
          <pre className="text-xs font-mono bg-slate-900/80 text-slate-300 p-4 rounded-xl overflow-x-auto border border-slate-800/80">
            {JSON.stringify(backendData || { error: backendError || 'Fetching telemetry...' }, null, 2)}
          </pre>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-6">
          <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Claria Hostel Automated Health Monitor</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HealthCheck;
