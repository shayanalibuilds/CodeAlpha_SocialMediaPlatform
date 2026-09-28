import { Link, useParams } from 'react-router-dom';
import UserList from '../components/UserList';

export default function FollowingPage() {
  const { username } = useParams();

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h1 className="text-lg font-bold text-slate-900">@{username} follows</h1>
        <Link to={`/u/${username}`} className="text-sm font-semibold text-emerald-700 hover:underline">
          Back to profile
        </Link>
      </div>
      <UserList
        endpoint={`/users/${encodeURIComponent(username)}/following`}
        emptyTitle="Not following anyone yet."
        emptyText="Find people on the Explore page."
      />
    </div>
  );
}
