import { baseApi } from "../api/baseApi";

import type {
  BoardResponse,
  BoardsResponse,
  CreateBoardRequest,
  UpdateBoardRequest,
} from "@/types/board";

export const boardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/boards
    getBoards: builder.query<BoardsResponse, void>({
      query: () => ({
        url: "/api/boards",
        method: "GET",
      }),
      providesTags: ["Board"],
    }),

    // GET /api/boards/:id
    getBoard: builder.query<BoardResponse, string>({
      query: (id) => ({
        url: `/api/boards/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Board", id },
      ],
    }),

    // POST /api/boards
    createBoard: builder.mutation<
      BoardResponse,
      CreateBoardRequest
    >({
      query: (body) => ({
        url: "/api/boards",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Board"],
    }),

    // PATCH /api/boards/:id
    updateBoard: builder.mutation<
      BoardResponse,
      {
        id: string;
        data: UpdateBoardRequest;
      }
    >({
      query: ({ id, data }) => ({
        url: `/api/boards/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Board",
        { type: "Board", id },
      ],
    }),

    // DELETE /api/boards/:id
    deleteBoard: builder.mutation<
      BoardResponse,
      string
    >({
      query: (id) => ({
        url: `/api/boards/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Board"],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useGetBoardQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
} = boardApi;