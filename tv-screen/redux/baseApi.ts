import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Agent", "Team", "AgentAudit", "Dashboard", "Reports", "Recipients", "ReportHistory", "Notifications"],
  endpoints: () => ({}),
});