import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken, clearToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!getToken()) {
        if (alive) setReady(true);
        return;
      }
      try {
        const data = await api('/auth/me');
        if (alive) setUser(data.user);
      } catch {
        clearToken();
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(identifier, password) {
        const data = await api('/auth/login', {
          method: 'POST',
          body: { email: identifier, password },
        });
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async register(fields) {
        const data = await api('/auth/register', { method: 'POST', body: fields });
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        try {
          await api('/auth/logout', { method: 'POST' });
        } catch {
          /* the token is removed locally regardless */
        }
        clearToken();
        setUser(null);
      },
      updateUser(partial) {
        setUser((current) => (current ? { ...current, ...partial } : current));
      },
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
