import { baseApi } from "@/redux/baseApi";

export interface TVBoardAgent {
  id: number;
  name: string;
  avatarUrl: string | null;
  goals: {
    daily: number;
    weekly: number;
  };
  sales: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  progress: {
    daily: number;
    weekly: number;
  };
}

export interface TVBoardData {
  company: {
    id: number;
    name: string;
    logoUrl: string | null;
    celebrationSoundUrl: string | null;
    tvTheme: string;
    timeZone: string;
  };
  teamGoal: {
    monthlyGoal: number;
    currentSales: number;
    progress: number;
  };
  dailyRecognition: {
    firstSale: string | null;
    mostSale: string | null;
    closestToGoal: string | null;
  };
  bellRinger: {
    id: number;
    name: string;
  } | null;
  leaderboards: {
    agents: {
      daily: TVBoardAgent[];
      weekly: TVBoardAgent[];
      monthly: TVBoardAgent[];
    };
  };
}

export const tvApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTVBoard: builder.query<{ success: boolean; message: string; data: TVBoardData }, { password?: string, deviceId?: string, deviceName?: string }>({
      query: ({ password, deviceId, deviceName }) => ({
        url: `/tv/board${password ? `?password=${encodeURIComponent(password)}` : ''}`,
        method: "GET",
        headers: {
          ...(deviceId && { "x-device-id": deviceId }),
          ...(deviceName && { "x-device-name": deviceName }),
        }
      }),
      providesTags: ["Dashboard"],
    }),
    tvLogin: builder.mutation<{ success: boolean; message: string; data: any }, { password?: string, deviceId?: string, deviceName?: string }>({
      query: (body) => ({
        url: `/tv/login`,
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export const { useGetTVBoardQuery, useTvLoginMutation } = tvApi;
