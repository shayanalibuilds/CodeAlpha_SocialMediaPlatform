import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const linkClass = ({ isActive }) => `navlink ${isActive ? 'navlink-active' : ''}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="inline-block h-6 w-6 rounded-full bg-emerald-600" aria-hidden="true" />
            Northwind Park
          </Link>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Main navigation">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/explore" className={linkClass}>Explore</NavLink>
            {user && <NavLink to={`/u/${user.username}`} className={linkClass}>@{user.username}</NavLink>}
            {ready && !user && <NavLink to="/login" className={linkClass}>Log in</NavLink>}
            {ready && !user && <Link to="/register" className="btn-primary ml-1 px-3 py-1.5">Register</Link>}
            {user && (
              <button type="button" onClick={handleLogout} className="btn-secondary px-3 py-1.5">
                Log out
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {ready ? <Outlet /> : <p className="py-10 text-center text-sm text-slate-500">Loading…</p>}
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <p className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500">
          Northwind Park — a family-safe demo for CodeAlpha Full Stack Task 2. Profiles, posts, comments, likes, and follows.
        </p>
      </footer>
    </div>
  );
}
