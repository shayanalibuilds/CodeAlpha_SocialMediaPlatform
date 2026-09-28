import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const username = form.username.trim().toLowerCase();
    if (!USERNAME_RE.test(username)) {
      setError('Usernames are 3-20 characters using letters, numbers, or underscores.');
      return;
    }
    if (form.password.length < 8) {
      setError('Passwords need at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      await register({
        name: form.name.trim(),
        username,
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mx-auto w-full max-w-md p-6">
      <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Join Northwind Park — clubs, books, coding, sports, and art.</p>
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="label" htmlFor="register-name">Name</label>
          <input
            id="register-name"
            className="input"
            value={form.name}
            onChange={update('name')}
            maxLength={60}
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="register-username">Username</label>
          <input
            id="register-username"
            className="input"
            value={form.username}
            onChange={update('username')}
            maxLength={20}
            placeholder="lowercase_letters_only"
            autoComplete="off"
            required
          />
          <p className="mt-1 text-xs text-slate-400">3-20 characters: letters, numbers, or underscores.</p>
        </div>
        <div>
          <label className="label" htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            className="input"
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            className="input"
            value={form.password}
            onChange={update('password')}
            minLength={8}
            autoComplete="new-password"
            required
          />
          <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>Create account</button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-emerald-700 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
