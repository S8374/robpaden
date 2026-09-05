import { baseApi } from "@/redux/baseApi";

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportSummary: builder.query<any, { range: string; customStart?: string; customEnd?: string }>({
      query: (params) => ({
        url: "/manager/reports/summary",
        method: "GET",
        params
      }),
      providesTags: ["Reports"]
    }),

    getSalesByAgentReport: builder.query<any, { range: string; customStart?: string; customEnd?: string }>({
      query: (params) => ({
        url: "/manager/reports/sales-by-agent",
        method: "GET",
        params
      }),
      providesTags: ["Reports"]
    }),

    getSalesEntryHistory: builder.query<any, { range: string; customStart?: string; customEnd?: string }>({
      query: (params) => ({
        url: "/manager/reports/sales-entry-history",
        method: "GET",
        params
      }),
      providesTags: ["Reports"]
    }),

    getRecipients: builder.query<any, void>({
      query: () => ({
        url: "/manager/reports/recipients",
        method: "GET"
      }),
      providesTags: ["Recipients"]
    }),

    addRecipient: builder.mutation<any, string>({
      query: (email) => ({
        url: "/manager/reports/recipients",
        method: "POST",
        data: { email }
      }),
      invalidatesTags: ["Recipients"]
    }),

    removeRecipient: builder.mutation<any, string>({
      query: (email) => ({
        url: "/manager/reports/recipients",
        method: "DELETE",
        data: { email }
      }),
      invalidatesTags: ["Recipients"]
    }),

    getReportHistory: builder.query<any, { range?: string; customStart?: string; customEnd?: string } | void>({
      query: (params) => ({
        url: "/manager/reports/history",
        method: "GET",
        params: params || undefined
      }),
      providesTags: ["ReportHistory"]
    }),

    generateAndEmailReport: builder.mutation<any, void>({
      query: () => ({
        url: "/manager/reports/generate",
        method: "POST"
      }),
      invalidatesTags: ["ReportHistory"]
    }),

    toggleReportGeneration: builder.mutation<any, boolean>({
      query: (isActive) => ({
        url: "/manager/reports/toggle",
        method: "POST",
        data: { isActive }
      }),
      invalidatesTags: ["Reports"] // Might want to refetch profile/settings but Reports tag is fine
    })
  })
});

export const {
  useGetReportSummaryQuery,
  useGetSalesByAgentReportQuery,
  useGetSalesEntryHistoryQuery,
  useGetRecipientsQuery,
  useAddRecipientMutation,
  useRemoveRecipientMutation,
  useGetReportHistoryQuery,
  useGenerateAndEmailReportMutation,
  useToggleReportGenerationMutation
} = reportApi;
