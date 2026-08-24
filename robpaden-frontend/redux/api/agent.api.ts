import { baseApi } from "@/redux/baseApi";

const agentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAgents: builder.query({
      query: (params?: { date?: string }) => ({
        url: "/manager/agents",
        method: "GET",
        params
      }),
      providesTags: ["Agent"],
    }),
    addAgent: builder.mutation({
      query: (agentData) => ({
        url: "/manager/agents/invite",
        method: "POST",
        data: agentData,
      }),
      invalidatesTags: ["Agent"],
    }),
    updateAgent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/manager/agents/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Agent"],
    }),
    deleteAgent: builder.mutation({
      query: (id) => ({
        url: `/manager/agents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Agent"],
    }),
    uploadFile: builder.mutation({
      query: (formData) => ({
        url: "/manager/upload",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),
    addDailySales: builder.mutation({
      query: (data) => ({
        url: "/manager/performance/daily-sales",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Agent", "Dashboard", "AgentAudit"], // Refresh agents list, dashboard, and agent audit list
    }),
    getAgentTodayAudit: builder.query({
      query: ({ agentId, date }) => ({
        url: `/manager/performance/agent/${agentId}/audit-today`,
        method: "GET",
        params: date ? { date } : undefined
      }),
      providesTags: (result, error, { agentId }) => [{ type: "AgentAudit", id: agentId }],
    }),
    reverseSale: builder.mutation({
      query: (auditId) => ({
        url: `/manager/performance/audit/${auditId}/reverse`,
        method: "POST",
      }),
      invalidatesTags: (result, error, auditId) => ["Agent", "AgentAudit", "Dashboard"],
    }),
    editSale: builder.mutation({
      query: ({ auditId, newCount }) => ({
        url: `/manager/performance/audit/${auditId}/edit`,
        method: "POST",
        data: { newCount },
      }),
      invalidatesTags: (result, error, { auditId }) => ["Agent", "AgentAudit", "Dashboard"],
    }),
    getManagerDashboard: builder.query({
      query: (params?: { date?: string }) => ({
        url: "/manager/performance/dashboard",
        method: "GET",
        params
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { 
  useGetAgentsQuery, 
  useAddAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useUploadFileMutation,
  useAddDailySalesMutation,
  useGetAgentTodayAuditQuery,
  useReverseSaleMutation,
  useEditSaleMutation,
  useGetManagerDashboardQuery
} = agentApi;
