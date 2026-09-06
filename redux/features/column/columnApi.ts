import { baseApi } from "../api/baseApi";

import type {
  ColumnResponse,
  ColumnsResponse,
  CreateColumnRequest,
  DeleteColumnResponse,
  UpdateColumnRequest,
} from "@/types/column";

export const columnApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/boards/:boardId/columns
    getColumns: builder.query<ColumnsResponse, string>({
      query: (boardId) => ({
        url: `/api/boards/${boardId}/columns`,
        method: "GET",
      }),

      providesTags: (_result, _error, boardId) => [
        {
          type: "Column",
          id: `BOARD-${boardId}`,
        },
      ],
    }),

    // PATCH /api/columns/:columnId/reorder
    reorderColumn: builder.mutation<
      ColumnsResponse,
      {
        columnId: string;
        position: number;
        boardId: string;
      }
    >({
      query: ({ columnId, position }) => ({
        url: `/api/columns/${columnId}/reorder`,
        method: "PATCH",
        body: {
          position,
        },
      }),

      invalidatesTags: (_result, _error, { boardId }) => [
        {
          type: "Column",
          id: `BOARD-${boardId}`,
        },
      ],
    }),

    // POST /api/boards/:boardId/columns
    createColumn: builder.mutation<ColumnResponse, CreateColumnRequest>({
      query: ({ boardId, name }) => ({
        url: `/api/boards/${boardId}/columns`,
        method: "POST",
        body: {
          name,
        },
      }),

      invalidatesTags: (_result, _error, { boardId }) => [
        {
          type: "Column",
          id: `BOARD-${boardId}`,
        },
      ],
    }),

    // PATCH /api/columns/:columnId
    updateColumn: builder.mutation<
      ColumnResponse,
      {
        columnId: string;
        boardId: string;
        data: {
          name?: string;
        };
      }
    >({
      query: ({ columnId, data }) => ({
        url: `/api/columns/${columnId}`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: (_result, _error, { boardId }) => [
        {
          type: "Column",
          id: `BOARD-${boardId}`,
        },
      ],
    }),

    // DELETE /api/columns/:columnId
    deleteColumn: builder.mutation<
      DeleteColumnResponse,
      {
        columnId: string;
        boardId: string;
      }
    >({
      query: ({ columnId }) => ({
        url: `/api/columns/${columnId}`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, { boardId }) => [
        {
          type: "Column",
          id: `BOARD-${boardId}`,
        },
      ],
    }),
  }),
});

export const {
  useGetColumnsQuery,
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
  useReorderColumnMutation,
} = columnApi;