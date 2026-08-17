import { baseApi } from "@/redux/baseApi";

export interface Office {
  id: number;
  name: string;
  settings?: {
    companyName?: string;
    logoUrl?: string;
    tvTheme?: string;
    dailyGoal?: number;
    weeklyGoal?: number;
    monthlyGoal?: number;
    timeZone?: string;
    officeStartTime?: string;
    officeCloseTime?: string;
  };
  status?: string;
  createdAt: string;
  // Included relations
  managers?: { id: number; name: string }[];
  agents?: { id: number; name: string }[];
}

export interface OfficeStats {
  totalOffices: number;
  activeManagers: number;
  totalAgents: number;
  activeTVBoards: number;
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
    getOfficeStats: builder.query<ApiResponse<OfficeStats>, void>({
      query: () => ({
        url: "/admin/v1/offices/stats",
        method: "GET",
      }),
      providesTags: ["OfficeStats"],
    }),
    createOffice: builder.mutation<ApiResponse<any>, FormData>({
      query: (payload) => ({
        url: "/admin/v1/offices",
        method: "POST",
        data: payload,
      }),
      // Invalidate both the list and the stats so they refetch automatically
      invalidatesTags: ["Offices", "OfficeStats"],
    }),
    updateOffice: builder.mutation<ApiResponse<any>, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/admin/v1/offices/${id}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: ["Offices", "OfficeStats"],
    }),
    deleteOffice: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/admin/v1/offices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Offices", "OfficeStats"],
    }),
  }),
});

export const {
  useGetOfficesQuery,
  useGetOfficeStatsQuery,
  useCreateOfficeMutation,
  useUpdateOfficeMutation,
  useDeleteOfficeMutation,
} = officeApi;
