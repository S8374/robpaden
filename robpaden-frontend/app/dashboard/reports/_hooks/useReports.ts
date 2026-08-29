import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { format } from "date-fns";
import { exportReportPdf } from "@/lib/utils/exportReportPdf";
import {
  useGetReportSummaryQuery, 
  useGetSalesByAgentReportQuery, 
  useGetSalesEntryHistoryQuery,
  useGetRecipientsQuery,
  useGetReportHistoryQuery,
  useGenerateAndEmailReportMutation,
  useToggleReportGenerationMutation
} from "@/redux/api/report.api";
import { useGetMeQuery } from "@/redux/api/auth.api";

export function useReports() {
  const [activeTab, setActiveTab] = useState("Today");
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isCustomRangeModalOpen, setIsCustomRangeModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [customRangeLabel, setCustomRangeLabel] = useState("Custom Range");
  const [customStart, setCustomStart] = useState<string | undefined>(undefined);
  const [customEnd, setCustomEnd] = useState<string | undefined>(undefined);

  const selectedDateStr = useSelector((state: RootState) => state.date.selectedDate);

  const handleCustomRangeApply = (start: string, end: string) => {
    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };
    setCustomStart(start);
    setCustomEnd(end);
    if (start === end) {
      setCustomRangeLabel(formatDate(start));
    } else {
      setCustomRangeLabel(`${formatDate(start)} - ${formatDate(end)}`);
    }
    setActiveTab("Custom Range");
  };

  useEffect(() => {
    if (!selectedDateStr) return;
    const date = new Date(selectedDateStr);
    const dateStr = format(date, 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    if (dateStr === todayStr) {
      if (activeTab !== "Today" && activeTab !== "This Week" && activeTab !== "This Month") {
        setActiveTab("Today");
        setCustomStart(undefined);
        setCustomEnd(undefined);
      }
    } else {
      handleCustomRangeApply(dateStr, dateStr);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateStr]);

  const getRangeParam = () => {
    switch (activeTab) {
      case "Today": return "today";
      case "This Week": return "week";
      case "This Month": return "month";
      case "Custom Range": return "custom";
      default: return "today";
    }
  };

  const rangeParam = getRangeParam();

  const { data: meData, refetch: refetchMe } = useGetMeQuery(undefined);
  const profile = meData?.data;
  const companyName = profile?.company?.name || "N/A";
  const managerName = profile?.name || "N/A";
  const monthlyGoal = profile?.company?.settings?.monthlyGoal || 0;
  
  const isReportGenerationActive = profile?.company?.settings?.isReportGenerationActive ?? true;

  const { data: summaryData, isLoading: isLoadingSummary } = useGetReportSummaryQuery({ range: rangeParam, customStart, customEnd });
  const { data: agentsData, isLoading: isLoadingAgents } = useGetSalesByAgentReportQuery({ range: rangeParam, customStart, customEnd });
  const { data: entryHistoryData, isLoading: isLoadingHistory } = useGetSalesEntryHistoryQuery({ range: rangeParam, customStart, customEnd });
  const { data: recipientsData, isLoading: isLoadingRecipients } = useGetRecipientsQuery();
  const { data: reportHistoryData, isLoading: isLoadingReportHistory } = useGetReportHistoryQuery({ range: rangeParam, customStart, customEnd });

  const [generateAndEmailReport, { isLoading: isGenerating }] = useGenerateAndEmailReportMutation();
  const [toggleReport, { isLoading: isToggling }] = useToggleReportGenerationMutation();

  const summary = summaryData?.data;
  const agents = agentsData?.data || [];
  const entryHistory = entryHistoryData?.data || [];
  const recipients = recipientsData?.data || [];
  const reportHistory = reportHistoryData?.data || [];

  const handleTabClick = (tab: string) => {
    if (tab === "Custom Range") {
      setIsCustomRangeModalOpen(true);
    } else {
      setActiveTab(tab);
      setCustomRangeLabel("Custom Range");
      setCustomStart(undefined);
      setCustomEnd(undefined);
    }
  };

  const handleInitialExportClick = async () => {
    try {
      await generateAndEmailReport().unwrap();
      toast.success("Report generated and emailed successfully!");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error.data?.message || "Failed to generate report");
    }
  };

  const handleCloseDayConfirm = async () => {
    try {
      await toggleReport(false).unwrap();
      await refetchMe();
      setIsCloseModalOpen(false);
      toast.success("Day closed! Automatic reports disabled.");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error.data?.message || "Failed to close day");
    }
  };

  const handleStartNewDay = async () => {
    try {
      await toggleReport(true).unwrap();
      await refetchMe();
      toast.success("New day started! Board is active.");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error.data?.message || "Failed to start new day");
    }
  };

  const handleResend = async (id: number) => {
    try {
      await generateAndEmailReport().unwrap();
      toast.success("Report resent successfully!");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error.data?.message || "Failed to resend report");
    }
  };

  const handleDownloadPDF = () => {
    const success = exportReportPdf({
      agents,
      summary,
      monthlyGoal,
      companyName,
      managerName,
      activeTab
    });
    
    if (!success) {
      toast.error("No data available to export.");
    }
  };

  return {
    state: {
      activeTab,
      isCloseModalOpen,
      isCustomRangeModalOpen,
      isExportModalOpen,
      customRangeLabel,
      isReportGenerationActive,
      isGenerating,
      isToggling,
      isLoadingSummary,
      isLoadingAgents,
      isLoadingHistory,
      isLoadingRecipients,
      isLoadingReportHistory
    },
    data: {
      summary,
      agents,
      entryHistory,
      recipients,
      reportHistory
    },
    actions: {
      setIsCloseModalOpen,
      setIsCustomRangeModalOpen,
      setIsExportModalOpen,
      handleCustomRangeApply,
      handleTabClick,
      handleInitialExportClick,
      handleCloseDayConfirm,
      handleStartNewDay,
      handleResend,
      handleDownloadPDF
    }
  };
}
