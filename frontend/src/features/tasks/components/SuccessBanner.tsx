export function SuccessBanner({ success }: { success: string }) {
  return (
    <div
      className="rounded-[var(--radius-md)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
      role="alert"
    >
      {success}
    </div>
  );
}
