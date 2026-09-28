import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import PostList from '../components/PostList';

function EditProfileForm({ user, onSaved, onCancel }) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api('/users/me', {
        method: 'PATCH',
        body: { name: name.trim(), bio, avatarUrl: avatarUrl.trim() },
      });
      onSaved(data.user);
    } catch (err) {
      setError(err.message || 'Could not save the profile.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card mt-4 space-y-4 p-4" onSubmit={handleSubmit}>
      <h2 className="font-semibold text-slate-900">Edit profile</h2>
      <div>
        <label className="label" htmlFor="edit-name">Name</label>
        <input
          id="edit-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="edit-bio">Bio</label>
        <textarea
          id="edit-bio"
          className="input"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          placeholder="Tell people what you are about."
        />
        <p className="mt-1 text-xs text-slate-400">{bio.length} / 200</p>
      </div>
      <div>
        <label className="label" htmlFor="edit-avatar">Avatar URL</label>
        <input
          id="edit-avatar"
          className="input"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/me.png"
        />
        <p className="mt-1 text-xs text-slate-400">Paste an image URL. No file uploads in this demo.</p>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>Save changes</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: viewer, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let alive = true;
    setProfile(null);
    setError('');
    setEditing(false);
    api(`/users/${encodeURIComponent(username)}`)
      .then((data) => {
        if (alive) setProfile(data.user);
      })
      .catch((err) => {
        if (alive) setError(err.message || 'User not found.');
      });
    return () => {
      alive = false;
    };
  }, [username]);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold text-slate-900">{error}</p>
        <Link to="/explore" className="btn-secondary mt-4 inline-flex">Back to Explore</Link>
      </div>
    );
  }
  if (!profile) return <Spinner />;

  const isSelf = viewer && viewer.id === profile.id;

  return (
    <div>
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <Avatar user={profile} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
            <p className="text-sm text-slate-500">@{profile.username}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {profile.bio || 'No bio yet.'}
            </p>
          </div>
          {isSelf && !editing && (
            <button type="button" className="btn-secondary" onClick={() => setEditing(true)}>
              Edit profile
            </button>
          )}
        </div>
      </div>
      {editing && (
        <EditProfileForm
          user={profile}
          onCancel={() => setEditing(false)}
          onSaved={(updated) => {
            setProfile(updated);
            updateUser({ name: updated.name, bio: updated.bio, avatarUrl: updated.avatarUrl });
            setEditing(false);
          }}
        />
      )}

      <h2 className="mb-3 mt-6 px-1 text-sm font-semibold text-slate-500">
        Posts by {profile.name}
      </h2>
      <PostList
        scope="explore"
        author={profile.username}
        emptyTitle="No updates yet."
        emptyText={isSelf ? 'Share your first update from the home page.' : 'Come back later.'}
      />
    </div>
  );
}
