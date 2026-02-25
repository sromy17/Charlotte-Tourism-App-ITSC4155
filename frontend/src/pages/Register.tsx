import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
const uppercaseRegex = /[A-Z]/;

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const navigate = useNavigate();

  const emailValid = useMemo(() => emailRegex.test(email), [email]);
  const passwordLengthValid = password.length >= 8;
  const passwordUpperValid = uppercaseRegex.test(password);
  const passwordSpecialValid = specialCharRegex.test(password);
  const nameValid = name.trim().length > 0;

  const allValid = emailValid && passwordLengthValid && passwordUpperValid && passwordSpecialValid && nameValid;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!allValid) return;

    // TODO: call backend register API
    // For now navigate to home as if registration succeeded
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow text-gray-900">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Create an account</h2>
      <form onSubmit={handleCreate} noValidate>
        <label className="block mb-3">
          <span className="text-sm font-medium">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-uncc-green focus:border-uncc-green text-gray-900"
            placeholder="Your full name"
            required
          />
          {touched.name && !nameValid && (
            <div className="text-red-600 text-sm mt-1">Please enter your name.</div>
          )}
        </label>

        <label className="block mb-3">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-uncc-green focus:border-uncc-green text-gray-900"
            placeholder="you@example.com"
            required
          />
          {touched.email && !emailValid && (
            <div className="text-red-600 text-sm mt-1">Please enter a valid email address.</div>
          )}
        </label>

        <label className="block mb-2">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-uncc-green focus:border-uncc-green text-gray-900"
            placeholder="Create a password"
            required
          />
        </label>

        <ul className="text-sm mb-4 ml-4 list-disc">
          <li className={passwordLengthValid ? 'text-green-600' : 'text-gray-600'}>At least 8 characters</li>
          <li className={passwordUpperValid ? 'text-green-600' : 'text-gray-600'}>An uppercase letter</li>
          <li className={passwordSpecialValid ? 'text-green-600' : 'text-gray-600'}>A special character (e.g. !@#$%)</li>
        </ul>

        <button
          type="submit"
          disabled={!allValid}
          className={`w-full py-2 rounded text-white ${allValid ? 'bg-uncc-green hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Create account
        </button>
      </form>
    </div>
  );
};

export default Register;
