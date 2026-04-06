import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useAuthStore } from '../state/authStore';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const authLoading = useAuthStore((state) => state.loading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
    }
  }, []);

  const emailValid = useMemo(() => emailRegex.test(email.trim()), [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!emailValid) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', trimmedEmail);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const result = await signIn(trimmedEmail, password);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setStatus(result.message);
      window.setTimeout(() => navigate('/profile'), 700);
    } catch (err) {
      setError((err as Error).message || 'Unable to sign in right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-7rem)] overflow-hidden bg-[#020202] px-6 pb-16 pt-4 text-[#F6F3EB]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-5rem] top-20 h-72 w-72 rounded-full bg-[#004D2C]/25 blur-3xl" />
        <div className="absolute bottom-10 right-[-3rem] h-80 w-80 rounded-full bg-[#d6c08e]/10 blur-3xl" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px)', backgroundSize: '70px 70px' }} />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section>
          <p className="luxury-label text-[#79bfa0]">Member Access</p>
          <h1 className="mt-4 max-w-xl text-5xl italic leading-tight sm:text-6xl">
            Sign in and keep your Charlotte plans beautifully organized.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/72">
            Access saved preferences, revisit itinerary ideas, and jump back into your trip planning without starting over.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              'Save preferences for quicker planning',
              'Keep your itinerary and profile in sync',
              'Return to your city map and day plans',
              'Demo-ready login flow for class presentation',
            ].map((item) => (
              <div key={item} className="luxury-panel rounded-[22px] p-4 text-sm text-white/80">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="luxury-panel rounded-[30px] p-6 sm:p-8">
          <div className="mb-6">
            <p className="luxury-label text-[#d6c08e]">Welcome Back</p>
            <h2 className="mt-2 text-3xl italic">Sign In</h2>
            <p className="mt-2 text-sm text-white/65">
              Enter your details to continue to your profile and trip planner.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <label className="block">
              <span className="mb-2 block text-sm text-white/80">Email</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <Mail size={16} className="text-[#79bfa0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/80">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <LockKeyhole size={16} className="text-[#79bfa0]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-white/55 transition hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-white/70">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent accent-[#79bfa0]"
                />
                Remember my email
              </label>

              <Link to="/forgot-password" className="text-[#d6c08e] transition hover:text-white">
                Forgot password?
              </Link>
            </div>

            {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
            {status && <div className="rounded-2xl border border-[#79bfa0]/30 bg-[#004D2C]/20 px-4 py-3 text-sm text-[#cfe9dc]">{status}</div>}

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#79bfa0] bg-[#004D2C]/50 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.25em] transition hover:bg-[#004D2C]/75 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting || authLoading ? 'Signing In...' : 'Sign In'}
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-sm text-white/65">
            New here?{' '}
            <Link to="/register" className="font-medium text-[#d6c08e] transition hover:text-white">
              Create an account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
