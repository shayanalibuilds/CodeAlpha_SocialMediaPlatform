import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

function HomePlaceholder() {
  return (
    <div className="card p-8 text-center">
      <p className="font-semibold text-slate-900">The home feed lands with the posts slice.</p>
      <p className="mt-1 text-sm text-slate-500">Auth and profiles are already wired up.</p>
      <Link to="/login" className="btn-primary mt-4 inline-flex">Log in</Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePlaceholder />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/u/:username" element={<ProfilePage />} />
            <Route
              path="*"
              element={
                <div className="card p-8 text-center">
                  <p className="font-semibold text-slate-900">Page not found.</p>
                  <Link to="/" className="btn-secondary mt-4 inline-flex">Back home</Link>
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
