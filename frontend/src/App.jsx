import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import FollowersPage from './pages/FollowersPage';
import FollowingPage from './pages/FollowingPage';
import GuestOnly from './routes/GuestOnly';
import { useDocumentTitle } from './hooks/useDocumentTitle';

function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="card p-8 text-center">
      <p className="font-semibold text-slate-900">Page not found.</p>
      <Link to="/" className="btn-secondary mt-4 inline-flex">Back home</Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
            <Route path="/posts/:id" element={<PostPage />} />
            <Route path="/u/:username" element={<ProfilePage />} />
            <Route path="/u/:username/followers" element={<FollowersPage />} />
            <Route path="/u/:username/following" element={<FollowingPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
