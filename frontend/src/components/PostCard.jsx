import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import Avatar from './Avatar';
import { timeAgo } from '../utils/time';

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useAuth();
  const canDelete = Boolean(user && (user.id === post.author.id || user.role === 'admin'));

  async function handleDelete() {
    if (!window.confirm('Delete this post? This also removes its comments.')) return;
    try {
      await api(`/posts/${post.id}`, { method: 'DELETE' });
      onDelete?.(post.id);
    } catch {
      /* keep the card; a refresh will show the truth */
    }
  }

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/u/${post.author.username}`} className="flex min-w-0 items-center gap-3">
          <Avatar user={post.author} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{post.author.name}</p>
            <p className="truncate text-xs text-slate-500">
              @{post.author.username} · {timeAgo(post.createdAt)}
            </p>
          </div>
        </Link>
        {canDelete && (
          <button type="button" className="btn-danger" onClick={handleDelete}>
            Delete post
          </button>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap break-words text-slate-800">{post.body}</p>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post attachment"
          loading="lazy"
          className="mt-3 max-h-96 w-full rounded-lg border border-slate-200 bg-slate-100 object-cover"
        />
      )}

      <div className="mt-3 flex items-center gap-2">
        <Link to={`/posts/${post.id}`} className="chip">
          Comments · {post.commentCount}
        </Link>
      </div>
    </article>
  );
}
