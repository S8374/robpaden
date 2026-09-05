import { baseApi } from "@/redux/baseApi";

export interface DashboardOverviewStats {
  totalOffices: number;
  newOfficesThisMonth: number;
  activeManagers: number;
  newManagersThisMonth: number;
  totalAgents: number;
  newAgentsThisMonth: number;
  activeTVBoards: number;
  activities: {
    id: number;
    action: string;
    entityName: string;
    iconType: string;
    createdAt: string;
  }[];
  topOffice?: {
    name: string;
    sales: number;
    goal: number;
  } | null;
  topManagers?: {
    name: string;
    sales: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<ApiResponse<DashboardOverviewStats>, void>({
      query: () => ({
        url: "/admin/v1/dashboard/overview",
        method: "GET",
      }),
      providesTags: ["DashboardStats"],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
} = dashboardApi;
