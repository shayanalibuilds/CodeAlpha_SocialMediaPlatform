import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePostList } from '../hooks/usePostList';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

function AuthedFeed() {
  const list = usePostList({ scope: 'feed' });

  return (
    <div className="space-y-4">
      <PostForm onCreated={list.prepend} />
      {list.loading ? (
        <Spinner />
      ) : list.error ? (
        <div className="card p-6 text-center text-sm text-rose-600">{list.error}</div>
      ) : list.posts.length === 0 ? (
        <EmptyState title="Your feed is quiet.">
          <p>Follow someone from Explore and their updates will land here.</p>
          <Link to="/explore" className="btn-primary mt-3 inline-flex">Explore posts</Link>
        </EmptyState>
      ) : (
        <>
          {list.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={list.removePost}
              onUpdate={list.updatePost}
            />
          ))}
          {list.hasMore && (
            <button type="button" className="btn-secondary w-full" onClick={list.loadMore}>
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="card p-6">
          <h1 className="text-lg font-bold text-slate-900">Welcome to Northwind Park</h1>
          <p className="mt-1 text-sm text-slate-600">
            A friendly, family-safe corner for clubs, books, coding, sports, and art.
            Log in to share updates and follow people you know.
          </p>
          <div className="mt-4 flex gap-2">
            <Link to="/login" className="btn-primary">Log in</Link>
            <Link to="/register" className="btn-secondary">Register</Link>
          </div>
        </div>
        <h2 className="px-1 text-sm font-semibold text-slate-500">Recent public posts</h2>
        <PostList
          scope="explore"
          emptyTitle="No posts yet."
          emptyText="Be the first to share an update once you join."
        />
      </div>
    );
  }

  return <AuthedFeed />;
}
