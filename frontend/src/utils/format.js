// "1 post", "2 posts", "0 followers". Pass an explicit plural for irregular words.
export function plural(count, singular, pluralForm = `${singular}s`) {
  const n = Number(count) || 0;
  return n === 1 ? singular : pluralForm;
}

export function countLabel(count, singular, pluralForm) {
  const n = Number(count) || 0;
  return `${n} ${plural(n, singular, pluralForm)}`;
}

// Posts and comments carry a snapshot of their author taken when they were
// loaded. When that author is the signed-in user, prefer the live profile from
// AuthContext so a name/avatar edit shows up everywhere without a reload.
export function freshAuthor(author, viewer) {
  if (!author || !viewer || author.id !== viewer.id) return author;
  return { ...author, name: viewer.name, avatarUrl: viewer.avatarUrl };
}
