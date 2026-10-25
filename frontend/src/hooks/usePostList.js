import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false); // same-tick guard: state alone can lag a double-click
  const [moreError, setMoreError] = useState('');
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
    if (loadingMoreRef.current) return; // double-click safe (ref + state)
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setMoreError('');
    const next = page + 1;
    try {
      const data = await api(buildUrl(scope, author, next));
      setPosts((current) => {
        // Dedupe by id so overlapping pages never render a post twice.
        const seen = new Set(current.map((post) => post.id));
        const fresh = data.posts.filter((post) => !seen.has(post.id));
        return [...current, ...fresh];
      });
      setPage(next);
      setHasMore(data.hasMore);
    } catch (err) {
      // Pagination failed — keep the posts already on screen and surface the
      // problem separately from the initial-load error.
      setMoreError(err.message || 'Could not load more posts.');
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
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

  return {
    posts,
    hasMore,
    loading,
    loadingMore,
    moreError,
    error,
    loadMore,
    prepend,
    removePost,
    updatePost,
  };
}
