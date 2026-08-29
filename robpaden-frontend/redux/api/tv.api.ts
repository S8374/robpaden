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
    getTVBoard: builder.query<{ success: boolean; message: string; data: TVBoardData }, number>({
      query: (companyId) => ({
        url: `/tv/board/${companyId}`,
        method: "GET"
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetTVBoardQuery } = tvApi;
