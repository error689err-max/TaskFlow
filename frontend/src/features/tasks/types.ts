export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  provider?: string | null;
  providerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskUser {
  id: string;
  role: "OWNER" | "MEMBER";
  userId: string;
  projectId: string;
  joinedAt: string;
  user: ProjectMember;
}

interface Project {
  title: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  project: Project;
  createdById: string;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  assignees: TaskUser[];
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId: string;
  assigneeIds: string[];
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeIds?: string[];
  dueDate?: string | null;
}

export interface TaskFilters {
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
  assigneeId: string | "ALL";
  search?: string;
}

export interface GenerateDescriptionPayload {
  title: string;
  projectId: string;
}

export interface GenerateDescriptionResponse {
  description: string;
}

export interface PaginatedTasksResponse {
  items: Task[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface FetchTasksPayload {
  projectId: string;
  cursor?: string;
}
