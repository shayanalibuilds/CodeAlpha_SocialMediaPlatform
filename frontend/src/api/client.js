const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';
const TOKEN_KEY = 'northwind_park_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* private mode: session-only login */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

// A rejected token means the session is over: drop it and tell the app so the
// UI can reset to the logged-out state instead of failing silently forever.
function handleUnauthorized(path) {
  if (path.startsWith('/auth/login') || path.startsWith('/auth/register')) return;
  clearToken();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('northwind:unauthorized'));
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401) handleUnauthorized(path);
    const error = new Error((data && data.error) || `Request failed (${res.status}).`);
    error.status = res.status;
    throw error;
  }
  return data;
}
