import { baseApi } from "../baseApi";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnreadNotifications: builder.query<any, void>({
      query: () => ({
        url: "/api/v1/notifications",
        method: "GET",
      }),
      providesTags: ["Notifications"] as any,
    }),
    markAsRead: builder.mutation<any, number>({
      query: (id) => ({
        url: `/api/v1/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"] as any,
    }),
    markAllAsRead: builder.mutation<any, void>({
      query: () => ({
        url: "/api/v1/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"] as any,
    }),
  }),
});

export const {
  useGetUnreadNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
