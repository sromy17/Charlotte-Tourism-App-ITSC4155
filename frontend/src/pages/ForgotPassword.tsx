import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Request failed');
      }

      setStatus('If that email exists, a password reset link was sent.');
      // optionally navigate after a delay
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError((err as Error).message || 'Failed to send reset link. Please try again later.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>
      <p className="text-sm mb-4">Enter your email to receive a password reset link.</p>
      <form onSubmit={handleSubmit}>
        <label className="block mb-4">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-uncc-green focus:border-uncc-green"
            placeholder="you@example.com"
            required
          />
        </label>

        {error && <div className="text-red-600 mb-3">{error}</div>}
        {status && <div className="text-green-600 mb-3">{status}</div>}

        <button
          type="submit"
          className="w-full bg-uncc-green text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Send reset link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
