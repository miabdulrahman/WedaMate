import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Eye, EyeOff, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Logo from '../../components/ui/Logo.jsx';

const fieldClass =
  'w-full px-3.5 py-2.5 bg-white border border-[var(--border)] rounded-lg text-sm text-[var(--ink)] placeholder:text-[#8a9a93] focus:outline-none focus:ring-2 focus:ring-[var(--primary-muted)] focus:border-[var(--primary)] transition-all';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const user = await register({ name, email, phone, password, role });
      showToast(`Welcome to WedaMate, ${user.name}!`, 'success');
      navigate(role === 'provider' ? '/provider/dashboard' : '/dashboard');
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.25rem)] flex items-stretch bg-[var(--surface)]">
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[#0c1613] items-center justify-center">
        <img
          src="/images/auth-scenic.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1613] via-[#0c1613]/55 to-[#0c1613]/40" />

        <div className="relative z-10 p-12 text-white max-w-md space-y-5 animate-fade-up">
          <Logo size="lg" theme="dark" to={null} />
          <h2 className="font-heading text-3xl font-bold tracking-tight leading-tight">
            Join the local
            <br />
            services network.
          </h2>
          <p className="text-sm text-white/65 leading-relaxed">
            Book trusted help or offer your skills — homeowners, specialists, and drivers across Sri Lanka.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[54%] flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[var(--border)] card-shadow p-6 sm:p-8 space-y-5 animate-fade-up">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>

          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
              Create account
            </h1>
            <p className="text-sm text-[var(--ink-muted)] mt-1">
              Join WedaMate to book or offer local services
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[var(--ink-muted)] block mb-1.5">
              I want to register as
            </span>
            <div className="grid grid-cols-2 p-1 bg-[var(--surface)] rounded-lg gap-1 border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'customer'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'provider'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                Provider
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-[var(--ink)] block mb-1.5">Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--ink)] block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--ink)] block mb-1.5">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 077 123 4567"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--ink)] block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={`${fieldClass} pr-10`}
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

            <div>
              <label className="text-xs font-semibold text-[var(--ink)] block mb-1.5">
                Confirm password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={fieldClass}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-1 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="text-center text-sm text-[var(--ink-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
