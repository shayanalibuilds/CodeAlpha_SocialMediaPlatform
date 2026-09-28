import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

function buildUrl(scope, author, page) {
  const params = new URLSearchParams({ scope, page: String(page) });
  if (author) params.set('author', author);
  return `/posts?${params.toString()}`;
}

export function usePostList({ scope = 'explore', author = '' } = {}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api(buildUrl(scope, author, 1))
      .then((data) => {
        if (!alive) return;
        setPosts(data.posts);
        setPage(1);
        setHasMore(data.hasMore);
      })
      .catch((err) => {
        if (alive) setError(err.message || 'Could not load posts.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [scope, author]);

  const loadMore = useCallback(async () => {
    const next = page + 1;
    try {
      const data = await api(buildUrl(scope, author, next));
      setPosts((current) => [...current, ...data.posts]);
      setPage(next);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message || 'Could not load more posts.');
    }
  }, [page, scope, author]);

  const prepend = useCallback((post) => {
    setPosts((current) => [post, ...current]);
  }, []);

  const removePost = useCallback((id) => {
    setPosts((current) => current.filter((post) => post.id !== id));
  }, []);

  const updatePost = useCallback((id, patch) => {
    setPosts((current) => current.map((post) => (post.id === id ? { ...post, ...patch } : post)));
  }, []);

  return { posts, hasMore, loading, error, loadMore, prepend, removePost, updatePost };
}
