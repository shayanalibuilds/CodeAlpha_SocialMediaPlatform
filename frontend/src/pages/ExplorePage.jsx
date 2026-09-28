import PostList from '../components/PostList';

export default function ExplorePage() {
  return (
    <div className="space-y-4">
      <div className="px-1">
        <h1 className="text-lg font-bold text-slate-900">Explore</h1>
        <p className="text-sm text-slate-500">All public posts, newest first.</p>
      </div>
      <PostList
        scope="explore"
        emptyTitle="No posts yet."
        emptyText="Be the first to share an update."
      />
    </div>
  );
}
