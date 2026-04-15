export function ErrorBanner({ error }: { error: string }) {
  return (
    <div
      className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      role="alert"
    >
      {error}
    </div>
  );
}
