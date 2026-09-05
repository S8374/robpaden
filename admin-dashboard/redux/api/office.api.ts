import { baseApi } from "@/redux/baseApi";

export interface Office {
  id: number;
  name: string;
  settings?: {
    companyName?: string;
    logoUrl?: string;
    celebrationSoundUrl?: string;
    celebrationSoundStartTime?: number;
    celebrationSoundDuration?: number;
    tvTheme?: string;
    tvPassword?: string;
    dailyGoal?: number;
    weeklyGoal?: number;
    monthlyGoal?: number;
    timeZone?: string;
    officeStartTime?: string;
    officeCloseTime?: string;
    weeklyResetDay?: number;
    workWeekEndDay?: number;
  };
  status?: string;
  createdAt: string;
  // Included relations
  managers?: { id: number; name: string }[];
  agents?: { id: number; name: string }[];
}


export interface TvDevice {
  id: string;
  companyId: number;
  deviceName: string;
  deviceId: string;
  isBlocked: boolean;
  lastSeenAt: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const officeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOffices: builder.query<ApiResponse<Office[]>, void>({
      query: () => ({
        url: "/admin/v1/offices",
        method: "GET",
      }),
      providesTags: ["Offices"],
    }),

    createOffice: builder.mutation<ApiResponse<any>, FormData>({
      query: (payload) => ({
        url: "/admin/v1/offices",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Offices", "DashboardStats"],
    }),
    updateOffice: builder.mutation<ApiResponse<any>, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/admin/v1/offices/${id}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: ["Offices", "DashboardStats"],
    }),
    deleteOffice: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/admin/v1/offices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Offices", "DashboardStats"],
    }),
    getTvDevices: builder.query<ApiResponse<TvDevice[]>, number>({
      query: (officeId) => ({
        url: `/admin/v1/offices/${officeId}/tv-devices`,
        method: "GET",
      }),
      providesTags: ["Offices"], // using the same tag for simplicity
    }),
    deleteTvDevice: builder.mutation<ApiResponse<any>, string>({
      query: (deviceId) => ({
        url: `/admin/v1/offices/tv-devices/${deviceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Offices"],
    }),
    blockTvDevice: builder.mutation<ApiResponse<any>, { deviceId: string; isBlocked: boolean }>({
      query: ({ deviceId, isBlocked }) => ({
        url: `/admin/v1/offices/tv-devices/${deviceId}/block`,
        method: "PATCH",
        data: { isBlocked },
      }),
      invalidatesTags: ["Offices"],
    }),
  }),
});

export const {
  useGetOfficesQuery,
  useCreateOfficeMutation,
  useUpdateOfficeMutation,
  useDeleteOfficeMutation,
  useGetTvDevicesQuery,
  useDeleteTvDeviceMutation,
  useBlockTvDeviceMutation,
} = officeApi;
