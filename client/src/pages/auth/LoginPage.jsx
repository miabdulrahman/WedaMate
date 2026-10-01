import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, User, Car, Shield, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Logo from '../../components/ui/Logo.jsx';

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

  const routeAfterLogin = (user) => {
    if (redirectPath) navigate(redirectPath);
    else if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'driver') navigate('/driver/dashboard');
    else if (user.role === 'provider') navigate('/provider/dashboard');
    else navigate('/dashboard');
  };

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
      routeAfterLogin(user);
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
      routeAfterLogin(user);
    } catch (err) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const demos = [
    { label: 'Customer', email: 'customer@wedamate.local', pass: 'customer123', icon: User },
    { label: 'Driver', email: 'driver@wedamate.local', pass: 'driver123', icon: Car },
    { label: 'Provider', email: 'nimal@wedamate.local', pass: 'provider123', icon: Wrench },
    { label: 'Admin', email: 'admin@wedamate.local', pass: 'admin123', icon: Shield }
  ];

  return (
    <div className="min-h-[calc(100vh-4.25rem)] flex items-stretch bg-[var(--surface)]">
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[#0c1613] items-center justify-center">
        <img
          src="/images/auth-scenic.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1613] via-[#0c1613]/55 to-[#0c1613]/40" />

        <div className="relative z-10 p-12 text-white max-w-md space-y-5 animate-fade-up">
          <Logo size="lg" theme="dark" to={null} />
          <h2 className="font-heading text-3xl font-bold tracking-tight leading-tight">
            Local services,
            <br />
            made easy.
          </h2>
          <p className="text-sm text-white/65 leading-relaxed">
            Connect with verified professionals and drivers across Sri Lanka — transparent pricing, trusted help.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[54%] flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[var(--border)] card-shadow p-6 sm:p-8 space-y-6 animate-fade-up">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>

          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--ink-muted)] mt-1">
              Sign in to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--ink)] block mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-[var(--border)] rounded-lg text-sm text-[var(--ink)] placeholder:text-[#8a9a93] focus:outline-none focus:ring-2 focus:ring-[var(--primary-muted)] focus:border-[var(--primary)] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--ink)] block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 bg-white border border-[var(--border)] rounded-lg text-sm text-[var(--ink)] placeholder:text-[#8a9a93] focus:outline-none focus:ring-2 focus:ring-[var(--primary-muted)] focus:border-[var(--primary)] transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--ink-muted)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[var(--border-strong)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[var(--primary)] hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="p-3.5 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <span className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-wider block mb-2.5 text-center">
              Demo accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              {demos.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.label}
                    type="button"
                    onClick={() => handleQuickDemoLogin(demo.email, demo.pass)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[var(--border)] text-left hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] font-semibold text-xs text-[var(--ink)] transition-colors cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-[var(--primary)]" />
                    {demo.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center text-sm text-[var(--ink-muted)]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-[var(--primary)] hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
