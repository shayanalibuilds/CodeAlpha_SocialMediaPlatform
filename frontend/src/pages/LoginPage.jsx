import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(identifier.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Could not log in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mx-auto w-full max-w-md p-6">
      <h1 className="text-xl font-bold text-slate-900">Log in</h1>
      <p className="mt-1 text-sm text-slate-500">Welcome back to Northwind Park.</p>
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="label" htmlFor="login-identifier">Email or username</label>
          <input
            id="login-identifier"
            className="input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>Log in</button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        New here?{' '}
        <Link to="/register" className="font-semibold text-emerald-700 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
