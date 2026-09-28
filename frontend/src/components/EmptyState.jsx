export default function EmptyState({ title, children }) {
  return (
    <div className="card p-8 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      {children && <div className="mt-2 text-sm text-slate-500">{children}</div>}
    </div>
  );
}
