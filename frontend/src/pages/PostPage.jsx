import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import Spinner from '../components/Spinner';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setPost(null);
    setError('');
    api(`/posts/${encodeURIComponent(id)}`)
      .then((data) => {
        if (alive) setPost(data.post);
      })
      .catch((err) => {
        if (alive) setError(err.message || 'Post not found.');
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold text-slate-900">{error}</p>
        <Link to="/explore" className="btn-secondary mt-4 inline-flex">Back to Explore</Link>
      </div>
    );
  }
  if (!post) return <Spinner />;

  return (
    <div>
      <PostCard
        post={post}
        onDelete={() => navigate('/')}
        onUpdate={(patch) => setPost((current) => ({ ...current, ...patch }))}
      />
      <CommentSection
        post={post}
        onCountChange={(delta) =>
          setPost((current) => ({
            ...current,
            commentCount: Math.max(0, current.commentCount + delta),
          }))
        }
      />
    </div>
  );
}
