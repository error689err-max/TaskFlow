import { useState } from "react";
import { UserPlus, Mail, Loader2 } from "lucide-react";
import type { AnimatedTooltipItem } from "../../../shared/components/AnimatedTooltip";
import { AnimatedTooltip } from "../../../shared/components/AnimatedTooltip";
import type { TaskUser } from "../types";

type ProjectMembersBarProps = {
  members: TaskUser[];
  loading: boolean;
  onInvite: (email: string) => Promise<void>;
};

export default function ProjectMembersBar({
  members,
  loading,
  onInvite,
}: ProjectMembersBarProps) {
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const tooltipItems: AnimatedTooltipItem[] = members.map((m) => ({
    id: m.id,
    name: m.user.name,
    designation: m.role,
    image:
      m.user.avatarUrl ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.name)}&background=random&color=fff&size=64`,
  }));

  const handleInvite = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    setInviteError(null);
    setInviting(true);
    setInviteSuccess(false);

    try {
      await onInvite(trimmed);
      setEmail("");
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch {
      setInviteError("Failed to send invite. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleInvite();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3.5 shadow-[var(--shadow-sm)]">
      {/* Members avatars */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          Members
        </span>

        {loading ? (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <Loader2 size={14} className="animate-spin" />
            Loading…
          </div>
        ) : members.length === 0 ? (
          <span className="text-xs text-[var(--color-text-secondary)]">
            No members yet
          </span>
        ) : (
          <div className="flex items-center">
            <AnimatedTooltip items={tooltipItems} />
            <span className="ml-4 text-xs text-[var(--color-text-secondary)]">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Invite by email */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-sm transition ${
              inviteError
                ? "border-red-400 bg-red-50"
                : "border-[var(--color-border)] bg-[var(--color-surface-hover)]"
            }`}
          >
            <Mail
              size={14}
              className="shrink-0 text-[var(--color-text-secondary)]"
            />
            <input
              type="email"
              placeholder="Invite by email…"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setInviteError(null);
              }}
              onKeyDown={handleKeyDown}
              className="w-52 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleInvite}
            disabled={inviting || !email.trim()}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inviting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <UserPlus size={14} />
            )}
            Invite
          </button>
        </div>

        {/* Feedback messages */}
        {inviteError && <p className="text-xs text-red-600">{inviteError}</p>}
        {inviteSuccess && (
          <p className="text-xs text-green-600">Invite sent successfully!</p>
        )}
      </div>
    </div>
  );
}
