import { baseApi } from "../api/baseApi";

// ============================================
// BOARD MEMBER TYPES
// ============================================

export interface BoardMemberUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  createdAt: string;
  user: BoardMemberUser;
}

export interface BoardMembersResponse {
  success: boolean;
  message: string;
  data: BoardMember[];
}

export interface AddMemberResponse {
  success: boolean;
  message: string;
  data: BoardMember;
}

export interface RemoveMemberResponse {
  success: boolean;
  message: string;
}

 


// ============================================
// BOARD MEMBER API
// ============================================

export const boardMemberApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================
    // GET BOARD MEMBERS
    // ========================================

    getBoardMembers: builder.query<BoardMembersResponse, string>({
      query: (boardId) => ({
        url: `/api/boards/${boardId}/members`,
        method: "GET",
      }),

      providesTags: (_result, _error, boardId) => [
        {
          type: "User",
          id: `BOARD-MEMBERS-${boardId}`,
        },
      ],
    }),

    // ========================================
    // ADD MEMBER
    // ========================================

    addBoardMember: builder.mutation<
      AddMemberResponse,
      {
        boardId: string;
        userId: string;
      }
    >({
      query: ({ boardId, userId }) => ({
        url: `/api/boards/${boardId}/members`,
        method: "POST",
        body: {
          userId,
        },
      }),

      invalidatesTags: (_result, _error, { boardId }) => [
        {
          type: "User",
          id: `BOARD-MEMBERS-${boardId}`,
        },
      ],
    }),

    // ========================================
    // REMOVE MEMBER
    // ========================================

    removeBoardMember: builder.mutation<
      RemoveMemberResponse,
      {
        boardId: string;
        userId: string;
      }
    >({
      query: ({ boardId, userId }) => ({
        url: `/api/boards/${boardId}/members/${userId}`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, { boardId }) => [
        {
          type: "User",
          id: `BOARD-MEMBERS-${boardId}`,
        },
      ],
    }),

  
  }),
});

// ============================================
// HOOKS
// ============================================

export const {
  useGetBoardMembersQuery,
  useAddBoardMemberMutation,
  useRemoveBoardMemberMutation,
   
} = boardMemberApi;