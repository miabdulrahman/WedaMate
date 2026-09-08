import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, User, Car, Shield, Wrench, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Logo from '../../components/ui/Logo.jsx';
import Button from '../../components/ui/Button.jsx';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const redirectPath = new URLSearchParams(location.search).get('redirect') || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const user = await login({ email, password });
      showToast(`Welcome back, ${user.name}!`, 'success');
      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'driver') {
        navigate('/driver/dashboard');
      } else if (user.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      setIsLoading(true);
      const user = await login({ email: demoEmail, password: demoPass });
      showToast(`Logged in as ${user.name} (${user.role})`, 'success');
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'driver') navigate('/driver/dashboard');
      else if (user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-stretch bg-white">
      {/* 1. Left Scenic Split Pane (Matching Image 2) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center">
        <img
          src="/images/auth-scenic.jpg"
          alt="Scenic Sri Lanka landscape"
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />
        {/* Emerald & dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/50 to-slate-950/70" />

        <div className="relative z-10 text-center p-12 text-white max-w-lg space-y-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl inline-block mb-2 border border-white/20">
            <Logo size="lg" className="brightness-150" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">
            WedaMate
          </h2>
          <p className="text-emerald-100 text-sm font-medium tracking-wide uppercase">
            Local Services, Made Easy.
          </p>
          <div className="pt-6 border-t border-white/20 text-xs text-emerald-100/80 leading-relaxed">
            Connecting thousands of homeowners, drivers, and skilled professionals across Sri Lanka with transparent pricing and verified safety.
          </div>
        </div>
      </div>

      {/* 2. Right Form Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-slate-50/50">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-emerald-700 hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Login'}
            </button>
          </form>

          {/* Social Logins */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold absolute">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer@wedamate.local', 'customer123')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer@wedamate.local', 'customer123')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Quick 1-Click Demo Accounts for seamless Pair Programming test */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              ⚡ Instant 1-Click Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer@wedamate.local', 'customer123')}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-left hover:border-emerald-600 font-medium text-slate-800"
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('driver@wedamate.local', 'driver123')}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-left hover:border-emerald-600 font-medium text-slate-800"
              >
                🚗 Driver
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('nimal@wedamate.local', 'provider123')}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-left hover:border-emerald-600 font-medium text-slate-800"
              >
                🔧 Provider
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@wedamate.local', 'admin123')}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-left hover:border-emerald-600 font-medium text-slate-800"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-slate-600">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-bold text-emerald-700 hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
