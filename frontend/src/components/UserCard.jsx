import { Link } from 'react-router-dom';
import Avatar from './Avatar';

export default function UserCard({ user }) {
  return (
    <Link
      to={`/u/${user.username}`}
      className="card flex items-center gap-3 p-4 transition-colors hover:bg-slate-50"
    >
      <Avatar user={user} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
        <p className="truncate text-xs text-slate-500">@{user.username}</p>
        {user.bio && <p className="mt-0.5 truncate text-xs text-slate-500">{user.bio}</p>}
      </div>
    </Link>
  );
}
