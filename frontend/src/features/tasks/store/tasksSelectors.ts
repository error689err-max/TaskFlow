// tasksSelectors.ts
import type { RootState } from "../../../store";

export const selectTasksState = (state: RootState) => state.tasks;

// tasksSelectors.ts — add these
export const selectNextCursor = (state: RootState) => state.tasks.nextCursor;
export const selectHasNextPage = (state: RootState) => state.tasks.hasNextPage;
export const selectLoadingMore = (state: RootState) => state.tasks.loadingMore;

export const selectTasksLoading = (state: RootState) => state.tasks.loading;
export const selectTasksError = (state: RootState) => state.tasks.error;
export const selectSelectedTask = (state: RootState) =>
  state.tasks.selectedTask;
export const selectTaskFilters = (state: RootState) => state.tasks.filters;
export const selectAiLoading = (state: RootState) => state.tasks.aiLoading;
export const selectGeneratedDescription = (state: RootState) =>
  state.tasks.generatedDescription;
export const selectProjectMembers = (state: RootState) => state.tasks.members;
export const selectTaskLoading = (state: RootState) => state.tasks.taskloading;
export const selectFilteredTasks = (state: RootState) => {
  const { tasks, filters } = state.tasks;

  return tasks.filter((task) => {
    const matchesStatus =
      filters.status === "ALL" || task.status === filters.status;

    const matchesPriority =
      filters.priority === "ALL" || task.priority === filters.priority;

    const matchesAssignee =
      filters.assigneeId === "ALL" ||
      task.assignees.some(
        (assignee) => assignee.user.id === filters.assigneeId,
      );

    return matchesStatus && matchesPriority && matchesAssignee;
  });
};

export const selectInviteSuccess = (state: RootState) =>
  state.tasks.inviteSuccess;

export const selectInviteError = (state: RootState) => state.tasks.inviteError;
