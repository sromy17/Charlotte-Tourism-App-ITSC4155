import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide your email and password.');
      return;
    }

    // TODO: call backend auth API
    // For now just pretend success and navigate home
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Sign In</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
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

        <label className="block mb-4">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-uncc-green focus:border-uncc-green"
            placeholder="Your password"
            required
          />
        </label>

        {error && <div className="text-red-600 mb-3">{error}</div>}

        <button
          type="submit"
          className="w-full bg-uncc-green text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Sign In
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm">Don't have an account?</p>
        <Link to="/register" className="text-uncc-green font-medium">
          Create an account
        </Link>
        <div className="mt-2">
          <Link to="/forgot-password" className="text-sm text-uncc-green">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
