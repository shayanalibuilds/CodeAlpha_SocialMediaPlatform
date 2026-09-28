import { useEffect, useState } from 'react';
import { api } from '../api/client';
import UserCard from './UserCard';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

export default function UserList({ endpoint, emptyTitle, emptyText }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setUsers(null);
    setError('');
    api(endpoint)
      .then((data) => {
        if (alive) setUsers(data.users);
      })
      .catch((err) => {
        if (alive) setError(err.message || 'User not found.');
      });
    return () => {
      alive = false;
    };
  }, [endpoint]);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold text-slate-900">{error}</p>
      </div>
    );
  }
  if (users === null) return <Spinner />;
  if (users.length === 0) {
    return <EmptyState title={emptyTitle}>{emptyText}</EmptyState>;
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserCard key={user.username} user={user} />
      ))}
    </div>
  );
}
