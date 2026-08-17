import { baseApi } from "@/redux/baseApi";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  agentLimit?: number | null;
  companyId?: number | null;
  company?: {
    id: number;
    name: string;
  } | null;
  managerId?: number | null;
  manager?: {
    id: number;
    name: string;
  } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<User[]>, void>({
      query: () => ({
        url: "/admin/v1/users",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    getUserDetails: builder.query<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/admin/v1/users/${id}/details`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),
    
    createUser: builder.mutation<ApiResponse<any>, any>({
      query: (payload) => ({
        url: "/admin/v1/users/invite",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Users", "UserStats"],
    }),

    updateUser: builder.mutation<ApiResponse<any>, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/admin/v1/users/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/admin/v1/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users", "UserStats"],
    }),

    toggleUserStatus: builder.mutation<ApiResponse<any>, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/v1/users/${id}/status`,
        method: "PATCH",
        data: { isActive },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
} = userApi;
