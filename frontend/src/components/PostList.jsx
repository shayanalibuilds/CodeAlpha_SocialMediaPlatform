import { usePostList } from '../hooks/usePostList';
import PostCard from './PostCard';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

export default function PostList({ scope = 'explore', author = '', emptyTitle, emptyText }) {
  const list = usePostList({ scope, author });

  if (list.loading) return <Spinner />;
  if (list.error && list.posts.length === 0) {
    return <div className="card p-6 text-center text-sm text-rose-600">{list.error}</div>;
  }
  if (list.posts.length === 0) {
    return <EmptyState title={emptyTitle}>{emptyText}</EmptyState>;
  }

  return (
    <div className="space-y-4">
      {list.posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDelete={list.removePost}
          onUpdate={list.updatePost}
        />
      ))}
      {list.moreError && (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-3 text-sm text-rose-600">
          <span>{list.moreError}</span>
          <button type="button" className="btn-secondary" onClick={list.loadMore}>
            Try again
          </button>
        </div>
      )}
      {list.hasMore && !list.moreError && (
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={list.loadMore}
          disabled={list.loadingMore}
        >
          {list.loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}
