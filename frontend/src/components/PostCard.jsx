import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import Avatar from './Avatar';
import { timeAgo } from '../utils/time';

function HeartIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M10 16.5c-3.5-2.2-6.5-4.6-6.5-7.7C3.5 6.6 5.2 5 7.3 5c1.1 0 2.1.5 2.7 1.4C10.6 5.5 11.6 5 12.7 5c2.1 0 3.8 1.6 3.8 3.8 0 3.1-3 5.5-6.5 7.7z" />
    </svg>
  );
}

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likeBusy, setLikeBusy] = useState(false);
  const canDelete = Boolean(user && (user.id === post.author.id || user.role === 'admin'));

  async function toggleLike() {
    if (!user) {
      navigate('/login');
      return;
    }
    setLikeBusy(true);
    try {
      const data = await api(`/posts/${post.id}/like`, {
        method: post.likedByMe ? 'DELETE' : 'POST',
      });
      onUpdate?.({ likeCount: data.likeCount, likedByMe: data.liked });
    } catch {
      /* keep the previous state; server stays the source of truth */
    } finally {
      setLikeBusy(false);
    }
  }

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
        <button
          type="button"
          onClick={toggleLike}
          disabled={likeBusy}
          aria-pressed={Boolean(post.likedByMe)}
          className={post.likedByMe ? 'chip-liked' : 'chip'}
        >
          <HeartIcon filled={Boolean(post.likedByMe)} />
          Like
          <span className="font-normal">· {post.likeCount}</span>
        </button>
        <Link to={`/posts/${post.id}`} className="chip">
          Comments · {post.commentCount}
        </Link>
      </div>
    </article>
  );
}
