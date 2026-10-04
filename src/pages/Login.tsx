import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Flame, Lock, Mail, Eye, EyeOff, Loader2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 text-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Bright Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-300/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-5xl bg-white border border-sky-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10 page-fade">

        {/* Left Hero Panel - Bright Blue & Yellow Accents */}
        <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" />

          {/* Brand Header */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-amber-400 text-slate-900 p-2.5 rounded-2xl shadow-lg shadow-amber-400/30">
              <Flame className="w-6 h-6 fill-slate-900 text-slate-900" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">CLARIA HOSTEL OS</span>
          </div>

          {/* Middle Copy */}
          <div className="my-10 relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-300/20 border border-amber-300/30 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Hostel Management Platform</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Bright, Efficient & Intelligent Living.
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
              Real-time room allocation, automated billing receipts, curfew gate checks, and AI occupancy trends.
            </p>

            {/* Metrics Pill Grid */}
            <div className="grid grid-cols-3 gap-3 pt-6">
              <div className="bg-white/10 backdrop-blur border border-white/15 p-3 rounded-2xl">
                <p className="text-xl font-extrabold text-amber-300">500+</p>
                <p className="text-[11px] text-blue-100 mt-0.5">Students</p>
              </div>
              <div className="bg-white/10 backdrop-blur border border-white/15 p-3 rounded-2xl">
                <p className="text-xl font-extrabold text-emerald-300">99.9%</p>
                <p className="text-[11px] text-blue-100 mt-0.5">Uptime</p>
              </div>
              <div className="bg-white/10 backdrop-blur border border-white/15 p-3 rounded-2xl">
                <p className="text-xl font-extrabold text-white">100%</p>
                <p className="text-[11px] text-blue-100 mt-0.5">Digital</p>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          <div className="flex items-center gap-2 text-xs text-blue-200 relative z-10">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Encrypted Institutional Authentication</span>
          </div>
        </div>

        {/* Right Panel - Clean White & Blue Form */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3 border border-amber-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Light & Bright Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your institution email address and password</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-3 px-4 rounded-2xl mb-6 font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aegis.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:shadow-blue-500/40 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Portal</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Help */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-2">Default Quick Credentials:</p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold border border-blue-100">Admin: admin@aegis.com</span>
              <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg font-bold border border-amber-200">Student: student1@university.edu</span>
              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg font-bold border border-emerald-200">Password: password123</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
