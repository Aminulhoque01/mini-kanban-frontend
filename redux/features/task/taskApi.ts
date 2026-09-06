import { baseApi } from "../api/baseApi";

import type {
  CreateTaskRequest,
  DeleteTaskResponse,
  MoveTaskRequest,
  TaskResponse,
  TasksResponse,
  UpdateTaskRequest,
} from "@/types/task";

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/boards/:boardId/tasks
    getTasks: builder.query<
      TasksResponse,
      {
        boardId: string;
        page?: number;
        limit?: number;
        status?: string;
        priority?: string;
        assigneeId?: string;
      }
    >({
      query: ({
        boardId,
        page = 1,
        limit = 100,
        status,
        priority,
        assigneeId,
      }) => {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(limit));

        if (status) {
          params.set("status", status);
        }

        if (priority) {
          params.set("priority", priority);
        }

        if (assigneeId) {
          params.set("assigneeId", assigneeId);
        }

        return {
          url: `/api/boards/${boardId}/tasks?${params.toString()}`,
          method: "GET",
        };
      },

      providesTags: (_result, _error, { boardId }) => [
        { type: "Task", id: `BOARD-${boardId}` },
      ],
    }),

    // GET /api/tasks/:taskId
    getTask: builder.query<TaskResponse, string>({
      query: (taskId) => ({
        url: `/api/tasks/${taskId}`,
        method: "GET",
      }),

      providesTags: (_result, _error, taskId) => [
        { type: "Task", id: taskId },
      ],
    }),

    // POST /api/boards/:boardId/tasks
    createTask: builder.mutation<
      TaskResponse,
      CreateTaskRequest
    >({
      query: ({
        boardId,
        columnId,
        title,
        description,
        priority,
        assigneeId,
      }) => ({
        url: `/api/boards/${boardId}/tasks`,
        method: "POST",
        body: {
          columnId,
          title,
          description,
          priority,
          assigneeId,
        },
      }),

      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Task", id: `BOARD-${boardId}` },
        { type: "Column", id: `BOARD-${boardId}` },
      ],
    }),

    // PATCH /api/tasks/:taskId
    updateTask: builder.mutation<
      TaskResponse,
      {
        taskId: string;
        boardId: string;
        data: UpdateTaskRequest;
      }
    >({
      query: ({ taskId, data }) => ({
        url: `/api/tasks/${taskId}`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: (_result, _error, { taskId, boardId }) => [
        { type: "Task", id: taskId },
        { type: "Task", id: `BOARD-${boardId}` },
        { type: "Column", id: `BOARD-${boardId}` },
      ],
    }),

    // DELETE /api/tasks/:taskId
    deleteTask: builder.mutation<
      DeleteTaskResponse,
      {
        taskId: string;
        boardId: string;
      }
    >({
      query: ({ taskId }) => ({
        url: `/api/tasks/${taskId}`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Task", id: `BOARD-${boardId}` },
        { type: "Column", id: `BOARD-${boardId}` },
      ],
    }),

    // PATCH /api/tasks/:taskId/move
    moveTask: builder.mutation<
      TaskResponse,
      {
        taskId: string;
        boardId: string;
        data: MoveTaskRequest;
      }
    >({
      query: ({ taskId, data }) => ({
        url: `/api/tasks/${taskId}/move`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Task", id: `BOARD-${boardId}` },
        { type: "Column", id: `BOARD-${boardId}` },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useLazyGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
} = taskApi;