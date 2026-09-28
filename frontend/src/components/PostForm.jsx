import { useState } from 'react';
import { api } from '../api/client';

const MAX_LENGTH = 280;

export default function PostForm({ onCreated }) {
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageField, setShowImageField] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const trimmed = body.trim();
  const remaining = MAX_LENGTH - body.length;
  const canSubmit = trimmed.length > 0 && body.length <= MAX_LENGTH && !busy;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setError('');
    setBusy(true);
    try {
      const data = await api('/posts', {
        method: 'POST',
        body: {
          body: trimmed,
          ...(showImageField && imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
        },
      });
      setBody('');
      setImageUrl('');
      setShowImageField(false);
      onCreated?.(data.post);
    } catch (err) {
      setError(err.message || 'Could not share the update.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card p-4" onSubmit={handleSubmit}>
      <label className="label" htmlFor="post-body">Share an update</label>
      <textarea
        id="post-body"
        className="input resize-none"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What is happening in the park?"
        maxLength={MAX_LENGTH + 40}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-xs font-semibold text-emerald-700 hover:underline"
            onClick={() => setShowImageField((value) => !value)}
          >
            {showImageField ? 'Hide image URL' : 'Add image URL'}
          </button>
          <span className={`text-xs ${remaining < 0 ? 'font-semibold text-rose-600' : 'text-slate-400'}`}>
            {remaining} / {MAX_LENGTH}
          </span>
        </div>
        <button type="submit" className="btn-primary" disabled={!canSubmit}>
          Post update
        </button>
      </div>
      {showImageField && (
        <input
          className="input mt-2"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/photo.jpg"
          aria-label="Image URL"
        />
      )}
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </form>
  );
}
