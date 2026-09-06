import { baseApi } from "../api/baseApi";
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/auth";


export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: User[];
  pagination: UsersPagination;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "/api/users/register",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/users/login",
        method: "POST",
        body,
      }),
    }),

    getMe: builder.query<MeResponse, void>({
      query: () => ({
        url: "/api/users/me",
        method: "GET",
      }),
    }),


      // ========================================
    // GET ALL USERS + SEARCH USERS
    // ========================================

    getUsers: builder.query<UsersResponse, GetUsersParams>({
      query: ({
        page = 1,
        limit = 10,
        search = "",
      }) => ({
        url: "/api/users",
        method: "GET",
        params: {
          page,
          limit,
          ...(search.trim()
            ? { search: search.trim() }
            : {}),
        },
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.data.map((user) => ({
                type: "User" as const,
                id: user.id,
              })),
              {
                type: "User" as const,
                id: "USER-LIST",
              },
            ]
          : [
              {
                type: "User" as const,
                id: "USER-LIST",
              },
            ],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useGetUsersQuery
} = authApi;