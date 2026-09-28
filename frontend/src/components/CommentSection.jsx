import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { timeAgo } from '../utils/time';

function CommentForm({ postId, onAdded }) {
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError('Write a comment first.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const data = await api(`/posts/${postId}/comments`, {
        method: 'POST',
        body: { body: trimmed },
      });
      setBody('');
      onAdded(data.comment);
    } catch (err) {
      setError(err.message || 'Could not add the comment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-4 space-y-2" onSubmit={handleSubmit}>
      <label className="label" htmlFor="comment-body">Add a comment</label>
      <textarea
        id="comment-body"
        className="input resize-none"
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={340}
        placeholder="Keep it kind and friendly."
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${body.length > 300 ? 'font-semibold text-rose-600' : 'text-slate-400'}`}>
          {body.length} / 300
        </span>
        <button type="submit" className="btn-primary" disabled={busy || !body.trim()}>
          Comment
        </button>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </form>
  );
}

function CommentList({ comments, onDelete }) {
  const { user } = useAuth();

  if (comments.length === 0) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        No comments yet. Start the conversation.
      </p>
    );
  }

  return (
    <ul className="mt-2 divide-y divide-slate-100">
      {comments.map((comment) => (
        <li key={comment.id} className="flex items-start justify-between gap-2 py-3">
          <div className="flex min-w-0 gap-3">
            <Avatar user={comment.author} size="sm" />
            <div className="min-w-0">
              <p className="text-sm">
                <Link
                  to={`/u/${comment.author.username}`}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  {comment.author.name}
                </Link>{' '}
                <span className="text-xs text-slate-500">
                  @{comment.author.username} · {timeAgo(comment.createdAt)}
                </span>
              </p>
              <p className="whitespace-pre-wrap break-words text-sm text-slate-800">{comment.body}</p>
            </div>
          </div>
          {user && user.id === comment.author.id && (
            <button
              type="button"
              className="btn-danger"
              onClick={() => onDelete(comment.id)}
            >
              Delete comment
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function CommentSection({ post, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setComments(null);
    setError('');
    api(`/posts/${post.id}/comments`)
      .then((data) => {
        if (alive) setComments(data.comments);
      })
      .catch((err) => {
        if (alive) setError(err.message || 'Could not load comments.');
      });
    return () => {
      alive = false;
    };
  }, [post.id]);

  async function handleDelete(commentId) {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api(`/comments/${commentId}`, { method: 'DELETE' });
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      onCountChange(-1);
    } catch {
      /* refresh shows the truth */
    }
  }

  return (
    <section className="card mt-4 p-4" aria-label="Comments">
      <h2 className="text-sm font-semibold text-slate-900">
        Comments · {post.commentCount}
      </h2>
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      {!error && comments === null && <Spinner label="Loading comments…" />}
      {!error && comments !== null && (
        <CommentList comments={comments} onDelete={handleDelete} />
      )}
      {user ? (
        <CommentForm
          postId={post.id}
          onAdded={(comment) => {
            setComments((current) => [...(current || []), comment]);
            onCountChange(1);
          }}
        />
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-emerald-700 hover:underline">Log in</Link>{' '}
          to join the conversation.
        </p>
      )}
    </section>
  );
}
