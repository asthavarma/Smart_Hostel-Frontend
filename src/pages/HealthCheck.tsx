import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, CheckCircle2, XCircle, RefreshCw, Server, Laptop, ShieldCheck, ArrowLeft } from 'lucide-react';

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
      let targetUrl = 'https://smart-hostel-backend-j4hl.onrender.com/api/health';
      if (import.meta.env.VITE_API_URL) {
        let envUrl = import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
        if (!envUrl.endsWith('/api')) envUrl = `${envUrl}/api`;
        targetUrl = `${envUrl}/health`;
      }

      const res = await axios.get(targetUrl, { timeout: 10000 });
      const end = performance.now();
      setLatency(Math.round(end - start));
      setBackendData(res.data);
    } catch (err: any) {
      const end = performance.now();
      setLatency(Math.round(end - start));
      setBackendError(err.response?.data?.error || err.message || 'Network Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const isHealthy = !loading && !backendError && (backendData?.status === 'healthy' || backendData?.services?.database === 'connected');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 text-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-300/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-2xl bg-white border border-sky-100 rounded-3xl p-8 shadow-2xl relative z-10 space-y-8 page-fade">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 text-slate-900 p-3 rounded-2xl shadow-md shadow-amber-400/30">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">System Health Telemetry</h1>
              <p className="text-xs text-slate-500 font-medium">Live operational status monitor for Frontend & Backend</p>
            </div>
          </div>
          <button
            onClick={fetchHealthStatus}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-blue-200 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Frontend Service Card */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Laptop className="w-4 h-4 text-blue-600" />
                <span>Frontend Client</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>HEALTHY</span>
              </span>
            </div>
            
            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-4">
              <div className="flex justify-between">
                <span>Framework:</span>
                <span className="font-semibold text-slate-900">Vite + React (TypeScript)</span>
              </div>
              <div className="flex justify-between">
                <span>Client Status:</span>
                <span className="font-bold text-emerald-600">ONLINE (200 OK)</span>
              </div>
              <div className="flex justify-between">
                <span>Build Environment:</span>
                <span className="font-semibold text-slate-900">{import.meta.env.MODE || 'production'}</span>
              </div>
            </div>
          </div>

          {/* Backend API Service Card */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Backend API & DB</span>
              </div>
              {isHealthy ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>HEALTHY</span>
                </span>
              ) : !loading && backendError ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>UNHEALTHY</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                  <span>CHECKING...</span>
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-4">
              <div className="flex justify-between">
                <span>API Endpoint:</span>
                <span className="font-semibold text-slate-900">/api/health</span>
              </div>
              <div className="flex justify-between">
                <span>Database Connection:</span>
                <span className={`font-bold ${backendData?.services?.database === 'connected' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {backendData?.services?.database || (backendError ? 'DISCONNECTED' : '...')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Network Latency:</span>
                <span className="font-semibold text-slate-900">{latency !== null ? `${latency} ms` : '...'}</span>
              </div>
              <div className="flex justify-between">
                <span>Server Uptime:</span>
                <span className="font-semibold text-slate-900">{backendData?.uptime || '...'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Response Payload Box */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold text-amber-900">Live JSON Payload Response</span>
            <span className="font-mono">Timestamp: {backendData?.timestamp || new Date().toISOString()}</span>
          </div>
          <pre className="text-xs font-mono bg-white text-slate-900 p-4 rounded-xl overflow-x-auto border border-amber-200 shadow-inner">
            {JSON.stringify(backendData || { error: backendError || 'Fetching telemetry...' }, null, 2)}
          </pre>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-6">
          <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Claria Hostel Automated Health Monitor</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HealthCheck;
