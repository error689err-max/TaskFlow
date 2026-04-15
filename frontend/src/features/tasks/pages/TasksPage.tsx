import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LayoutList, Kanban, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import PrimaryButton from "../../../shared/components/buttons/PrimaryButton";
import KanbanBoard from "../components/KanbanBoard";
import TaskList from "../components/TaskList";
import Loader from "../../../shared/components/Loader";
import ProjectMembersBar from "../components/Projectmembersbar";
import { Filter } from "lucide-react";
import { ErrorBanner } from "../components/ErrorBanner";
import { SuccessBanner } from "../components/SuccessBanner";

import type {
  Task,
  TaskFilters as TaskFiltersType,
  TaskPriority,
  TaskStatus,
} from "../types";
import {
  selectAiLoading,
  selectFilteredTasks,
  selectGeneratedDescription,
  selectProjectMembers,
  selectTaskFilters,
  selectTasksError,
  selectTasksLoading,
  selectNextCursor,
  selectHasNextPage,
  selectLoadingMore,
  selectTaskLoading,
  selectInviteError,
  selectInviteSuccess,
} from "../store/tasksSelectors";
import {
  clearGeneratedDescription,
  clearTasksError,
  setPriorityFilter,
  setAssignedToFilter,
  setTaskStatusOptimistic,
  revertTaskStatus,
  setStatusFilter,
  clearInviteError,
  clearSuccessError,
} from "../store/tasksSlice";
import {
  createTask,
  deleteTask,
  fetchMembers,
  fetchTasks,
  generateTaskDescription,
  updateTask,
  sendProjectInvite,
} from "../store/tasksThunks";

type TaskFormData = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];
  dueDate?: string | null;
};

export default function TasksPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectFilteredTasks);
  const members = useAppSelector(selectProjectMembers);
  const loading = useAppSelector(selectTasksLoading);
  const error = useAppSelector(selectTasksError);
  const filters = useAppSelector(selectTaskFilters);
  const aiLoading = useAppSelector(selectAiLoading);
  const taskloading = useAppSelector(selectTaskLoading);
  const generatedDescription = useAppSelector(selectGeneratedDescription);
  const nextCursor = useAppSelector(selectNextCursor);
  const hasNextPage = useAppSelector(selectHasNextPage);
  const loadingMore = useAppSelector(selectLoadingMore);
  const inviteError = useAppSelector(selectInviteError);
  const inviteSuccess = useAppSelector(selectInviteSuccess);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const activeFiltersCount = [
    filters.assigneeId !== "ALL",
    filters.status !== "ALL",
    filters.priority !== "ALL",
  ].filter(Boolean).length;

  // Initial fetch
  useEffect(() => {
    if (!projectId) return;
    dispatch(fetchTasks({ projectId }));
    dispatch(fetchMembers(projectId));
  }, [dispatch, projectId]);

  // Cleanup generated description on unmount
  useEffect(() => {
    return () => {
      dispatch(clearGeneratedDescription());
    };
  }, [dispatch]);

  // Auto-clear error after 6s
  useEffect(() => {
    const timers: number[] = [];

    if (error) {
      timers.push(window.setTimeout(() => dispatch(clearTasksError()), 6000));
    }

    if (inviteError) {
      timers.push(window.setTimeout(() => dispatch(clearInviteError()), 6000));
    }

    if (inviteSuccess) {
      timers.push(window.setTimeout(() => dispatch(clearSuccessError()), 6000));
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [error, inviteError, inviteSuccess, dispatch]);

  const handleLoadMore = () => {
    if (!projectId || !hasNextPage || loadingMore) return;
    dispatch(fetchTasks({ projectId, cursor: nextCursor ?? undefined }));
  };

  const handleStatusChange = (value: TaskFiltersType["status"]) => {
    dispatch(setStatusFilter(value));
  };

  const handlePriorityChange = (value: TaskFiltersType["priority"]) => {
    dispatch(setPriorityFilter(value));
  };

  const handleAssigneeChange = (value: TaskFiltersType["assigneeId"]) => {
    dispatch(setAssignedToFilter(value));
  };

  // Modal handlers
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    dispatch(clearGeneratedDescription());
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    dispatch(clearGeneratedDescription());
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    dispatch(clearGeneratedDescription());
    setIsTaskModalOpen(true);
  };

  const handleSubmit = async (data: TaskFormData) => {
    if (editingTask) {
      await dispatch(
        updateTask({
          taskId: editingTask.id,
          payload: {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            assigneeIds: data.assigneeIds,
            dueDate: data.dueDate,
          },
        }),
      );
      handleCloseTaskModal();
      return;
    }

    if (!projectId) return;
    await dispatch(
      createTask({
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assigneeIds: data.assigneeIds,
        dueDate: data.dueDate,
        projectId,
      }),
    );
    handleCloseTaskModal();
  };

  const handleGenerateDescription = (title: string, projectId: string) => {
    if (!title.trim()) return;
    dispatch(generateTaskDescription({ title, projectId }));
  };

  const handleKanbanStatusChange = (taskId: string, status: TaskStatus) => {
    const previousTask = tasks.find((t) => t.id === taskId);
    if (!previousTask) return;

    dispatch(setTaskStatusOptimistic({ taskId, status }));

    dispatch(updateTask({ taskId, payload: { status } }))
      .unwrap()
      .catch(() => {
        dispatch(
          revertTaskStatus({
            taskId,
            previousStatus: previousTask.status,
          }),
        );
      });
  };

  const handleInvite = async (email: string) => {
    if (!projectId) return;

    const result = await dispatch(sendProjectInvite({ email, projectId }));

    if (sendProjectInvite.fulfilled.match(result)) {
      console.log("Invite sent:", result.payload.message);
    } else {
      console.error("Invite failed:", result.payload);
    }
  };

  if (!projectId) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)]">
        Open a project from the Projects page to view tasks.
      </div>
    );
  }

  return (
    <div className="h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {tasks[0]?.project?.title}
          </h1>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
              <button
                type="button"
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition ${
                  view === "list"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <LayoutList size={15} />
                List
              </button>
              <button
                type="button"
                onClick={() => setView("kanban")}
                className={`flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition ${
                  view === "kanban"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Kanban size={15} />
                Kanban
              </button>
            </div>

            <PrimaryButton onClick={handleOpenCreateModal} icon={<Plus />}>
              New Task
            </PrimaryButton>
          </div>
        </div>

        {/* Members bar avatars + invite */}
        <ProjectMembersBar
          members={members}
          loading={loading}
          onInvite={handleInvite}
        />

        {/* Filter Button */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm"
            >
              <Filter size={16} className="text-blue-700" />
              Filters
            </button>

            {/* Badge */}
            {activeFiltersCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </div>
        </div>

        {/* Filter Modal */}
        {isFilterModalOpen && (
          <TaskFilters
            filters={filters}
            users={members}
            onAssigneeChange={handleAssigneeChange}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onClose={() => setIsFilterModalOpen(false)}
          />
        )}

        {/* Error banner */}
        {error ? <ErrorBanner error={error} /> : null}

        {inviteError ? <ErrorBanner error={inviteError} /> : null}
        {inviteSuccess ? <SuccessBanner success={inviteSuccess} /> : null}

        {/* Task list / kanban */}
        {taskloading ? (
          <div className="flex items-center justify-center p-10 text-xl text-[var(--color-text-secondary)]">
            <Loader />
          </div>
        ) : !tasks.length ? (
          <p className="flex items-center justify-center p-10 text-xl text-[var(--color-text-secondary)]">
            No tasks found.
          </p>
        ) : view === "list" ? (
          <TaskList
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={(taskId) => dispatch(deleteTask(taskId))}
          />
        ) : (
          <KanbanBoard
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={(taskId) => dispatch(deleteTask(taskId))}
            onStatusChange={handleKanbanStatusChange}
          />
        )}

        {/* Load more button */}
        {hasNextPage && !loading && (
          <div className="flex justify-center py-4">
            <PrimaryButton onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? "Loading..." : "Load More"}
            </PrimaryButton>
          </div>
        )}

        {/* End of list indicator */}
        {!hasNextPage && tasks.length > 0 && !loading && (
          <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">
            All tasks loaded
          </p>
        )}

        {/* Task form modal */}
        {isTaskModalOpen && (
          <TaskForm
            initialData={editingTask}
            users={members}
            projectId={projectId}
            loading={loading}
            aiLoading={aiLoading}
            generatedDescription={generatedDescription}
            onGenerateDescription={handleGenerateDescription}
            onClose={handleCloseTaskModal}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
