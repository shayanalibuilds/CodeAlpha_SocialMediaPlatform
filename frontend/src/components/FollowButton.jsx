import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function FollowButton({ username, isFollowing, onChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <button type="button" className="btn-primary" onClick={() => navigate('/login')}>
        Follow
      </button>
    );
  }

  async function toggle() {
    setBusy(true);
    setError('');
    try {
      const data = await api(`/users/${encodeURIComponent(username)}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });
      onChange?.(data);
    } catch (err) {
      setError(err.message || 'Could not update the follow.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className={isFollowing ? 'btn-secondary' : 'btn-primary'}
        disabled={busy}
        onClick={toggle}
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
