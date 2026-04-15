import type { TaskFilters as TaskFiltersType, TaskUser } from "../types";
import PrimaryButton from "../../../shared/components/buttons/PrimaryButton";
interface TaskFiltersProps {
  filters: TaskFiltersType;
  users: TaskUser[];
  onStatusChange: (value: TaskFiltersType["status"]) => void;
  onPriorityChange: (value: TaskFiltersType["priority"]) => void;
  onAssigneeChange: (value: TaskFiltersType["assigneeId"]) => void;
  onClose: () => void;
}

export default function TaskFilters({
  filters,
  users,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onClose,
}: TaskFiltersProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 ">
      <div className="w-full max-w-lg rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Filter Tasks
          </h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4">
          {/* Assignee */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">
              Assignee
            </label>
            <select
              value={filters.assigneeId}
              onChange={(e) =>
                onAssigneeChange(
                  e.target.value as TaskFiltersType["assigneeId"],
                )
              }
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm"
            >
              <option value="ALL">All Assignees</option>
              {users.map((user) => (
                <option key={user.id} value={user.user.id}>
                  {user.user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                onStatusChange(e.target.value as TaskFiltersType["status"])
              }
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) =>
                onPriorityChange(e.target.value as TaskFiltersType["priority"])
              }
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm"
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {/* Footer */}
          <div className=" flex flex-col gap-3 items-center justify-center w-full">
            <PrimaryButton
              onClick={() => {
                onAssigneeChange("ALL");
                onStatusChange("ALL");
                onPriorityChange("ALL");
              }}
              className="w-full"
            >
              Reset Filters
            </PrimaryButton>

            {/* Close Button using PrimaryButton */}
            <PrimaryButton onClick={onClose} className="w-full">
              Close
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
