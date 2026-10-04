import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Flame, Lock, Mail, Eye, EyeOff, Loader2, Sparkles, CheckCircle2, ShieldCheck, Sun, Moon } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10 page-fade">

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

        {/* Right Panel - Form with Dark Mode Toggle */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900 relative">
          
          {/* Dark Mode Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="absolute top-6 right-6 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
            aria-label="Toggle Dark Mode"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-3 border border-amber-200 dark:border-amber-700/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Institutional Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Sign In to Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your institution email address and password</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs py-3 px-4 rounded-2xl mb-6 font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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

        </div>

      </div>
    </div>
  );
};

export default Login;
