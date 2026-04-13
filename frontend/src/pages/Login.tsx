import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login: React.FC = () => {
  const navigate = useNavigate();

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

      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Optional: store user info
      localStorage.setItem('user', JSON.stringify(data));

      setStatus('Login successful');

      setTimeout(() => {
        window.location.href = '/profile';
      }, 700);

    } catch (err) {
      setError((err as Error).message || 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-7rem)] overflow-hidden bg-[#020202] px-6 pb-16 pt-4 text-[#F6F3EB]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-5rem] top-20 h-72 w-72 rounded-full bg-[#004D2C]/25 blur-3xl" />
        <div className="absolute bottom-10 right-[-3rem] h-80 w-80 rounded-full bg-[#d6c08e]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section>
          <h1 className="mt-4 max-w-xl text-5xl italic leading-tight sm:text-6xl">
            Sign in and keep your plans organized.
          </h1>
        </section>

        <section className="luxury-panel rounded-[30px] p-6 sm:p-8">
          <h2 className="text-3xl italic mb-4">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <label className="block">
              <span className="mb-2 block text-sm">Email</span>
              <div className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                <Mail size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                <LockKeyhole size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && <div className="text-red-500 text-sm">{error}</div>}
            {status && <div className="text-green-500 text-sm">{status}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-green-700 text-white rounded"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-sm">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
