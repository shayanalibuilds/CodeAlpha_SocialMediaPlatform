import { useEffect, useState } from 'react';

const COLORS = ['bg-emerald-600', 'bg-sky-600', 'bg-rose-600', 'bg-amber-600', 'bg-violet-600', 'bg-teal-600'];
const SIZES = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-16 w-16 text-2xl',
  xl: 'h-20 w-20 text-3xl',
};

function colorFor(seed) {
  let hash = 0;
  for (const ch of String(seed || '?')) {
    hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  }
  return COLORS[hash % COLORS.length];
}

export default function Avatar({ user, size = 'md' }) {
  const name = user?.name || user?.username || '?';
  const initial = (name.trim().charAt(0) || '?').toUpperCase();
  const sizeClass = SIZES[size] || SIZES.md;
  const avatarUrl = user?.avatarUrl || '';
  const [broken, setBroken] = useState(false);

  // A new URL (e.g. after a profile edit) gets a fresh chance to load.
  useEffect(() => {
    setBroken(false);
  }, [avatarUrl]);

  if (avatarUrl && !broken) {
    return (
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        onError={() => setBroken(true)}
        // overflow-hidden + text-[0] keep alt text inside the circle while loading.
        className={`${sizeClass} shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 object-cover text-[0px]`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${sizeClass} ${colorFor(user?.username)} inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white`}
    >
      {initial}
    </span>
  );
}
