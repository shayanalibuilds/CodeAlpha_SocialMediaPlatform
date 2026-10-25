import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Login/Register are for guests. A signed-in visitor is sent to their feed
// instead of seeing a form that would silently replace their session.
export default function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
}
