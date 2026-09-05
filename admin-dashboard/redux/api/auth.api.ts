import { baseApi } from "@/redux/baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (userInfo) => ({
        url: "/admin/login",
        method: "POST",
        data: userInfo,
      }),
    }),
    register: builder.mutation({
      query: (userInfo) => ({
        url: "/user/register",
        method: "POST",
        data: userInfo,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/admin/logout",
        method: "POST",
      }),
    }),
    getMe: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/auth/me",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Profile"],
    }),
    uploadAvatar: builder.mutation({
      query: (formData) => ({
        url: "/auth/avatar",
        method: "POST",
        data: formData,
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const { 
  useRegisterMutation, 
  useLoginMutation, 
  useLogoutMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation
} = authApi;