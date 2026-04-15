import { createAsyncThunk } from "@reduxjs/toolkit";
import { tasksApi } from "../api/tasks.api";
import { inviteApi } from "../api/invite.api";
import type {
  CreateTaskPayload,
  GenerateDescriptionPayload,
  Task,
  TaskUser,
  UpdateTaskPayload,
  PaginatedTasksResponse,
  FetchTasksPayload,
} from "../types";
import { taskAiApi } from "../api/taskAi.api";

export const fetchTasks = createAsyncThunk<
  PaginatedTasksResponse,
  FetchTasksPayload,
  { rejectValue: string }
>("tasks/fetchTasks", async ({ projectId, cursor }, thunkAPI) => {
  try {
    return await tasksApi.getTasks(projectId, cursor);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Failed to fetch tasks",
    );
  }
});

export const fetchMembers = createAsyncThunk<
  TaskUser[],
  string,
  { rejectValue: string }
>("tasks/fetchMembers", async (projectId, thunkAPI) => {
  try {
    return await tasksApi.getProjectMembers(projectId);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Failed to fetch project members",
    );
  }
});

export const createTask = createAsyncThunk<
  Task,
  CreateTaskPayload,
  { rejectValue: string }
>("tasks/createTask", async (payload, thunkAPI) => {
  try {
    return await tasksApi.createTask(payload);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Failed to create task",
    );
  }
});

export const updateTask = createAsyncThunk<
  Task,
  { taskId: string; payload: UpdateTaskPayload },
  { rejectValue: string }
>("tasks/updateTask", async ({ taskId, payload }, thunkAPI) => {
  try {
    return await tasksApi.updateTask(taskId, payload);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Failed to update task",
    );
  }
});

export const deleteTask = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("tasks/deleteTask", async (taskId, thunkAPI) => {
  try {
    return await tasksApi.deleteTask(taskId);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Failed to delete task",
    );
  }
});

export const generateTaskDescription = createAsyncThunk<
  string,
  GenerateDescriptionPayload,
  { rejectValue: string }
>("tasks/generateTaskDescription", async (payload, thunkAPI) => {
  try {
    const response = await taskAiApi.generateDescription(payload);
    return response.description;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Failed to generate description",
    );
  }
});

export const sendProjectInvite = createAsyncThunk<
  { message: string },
  { email: string; projectId: string },
  { rejectValue: string }
>("invite/sendProjectInvite", async ({ email, projectId }, thunkAPI) => {
  try {
    return await inviteApi.sendInvite(email, projectId);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Failed to send invite",
    );
  }
});
