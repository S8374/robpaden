import { baseApi } from "@/redux/baseApi";

const agentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAgents: builder.query({
      query: () => ({
        url: "/manager/agents",
        method: "GET",
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
  }),
});

export const { 
  useGetAgentsQuery, 
  useAddAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useUploadFileMutation
} = agentApi;
