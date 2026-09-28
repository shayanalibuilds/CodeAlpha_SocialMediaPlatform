import { Link, useParams } from 'react-router-dom';
import UserList from '../components/UserList';

export default function FollowersPage() {
  const { username } = useParams();

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h1 className="text-lg font-bold text-slate-900">Followers of @{username}</h1>
        <Link to={`/u/${username}`} className="text-sm font-semibold text-emerald-700 hover:underline">
          Back to profile
        </Link>
      </div>
      <UserList
        endpoint={`/users/${encodeURIComponent(username)}/followers`}
        emptyTitle="No followers yet."
        emptyText="Updates and kind posts bring people in."
      />
    </div>
  );
}
