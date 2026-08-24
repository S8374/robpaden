"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Header } from "@/components/dashboard/Header";
import { SalesByAgentTable } from "@/components/dashboard/reports/SalesByAgentTable";
import { ReportHistoryTable } from "@/components/dashboard/reports/ReportHistoryTable";
import { EmailRecipientsBlock } from "@/components/dashboard/reports/EmailRecipientsBlock";
import { SalesEntryHistoryTable } from "@/components/dashboard/reports/SalesEntryHistoryTable";
import { CloseDayModal } from "@/components/dashboard/reports/CloseDayModal";
import { CustomDateRangeModal } from "@/components/dashboard/reports/CustomDateRangeModal";
import { ExportModal } from "@/components/dashboard/reports/ExportModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("Today");
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isCustomRangeModalOpen, setIsCustomRangeModalOpen] = useState(false);
  const [customRangeLabel, setCustomRangeLabel] = useState("Custom Range");
  const [customStart, setCustomStart] = useState<string | undefined>(undefined);
  const [customEnd, setCustomEnd] = useState<string | undefined>(undefined);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Map activeTab to backend range parameter
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
  
  // Real DB state for if report generation is active
  const isReportGenerationActive = profile?.company?.settings?.isReportGenerationActive ?? true;

  const { data: summaryData, isLoading: isLoadingSummary } = useGetReportSummaryQuery({ range: rangeParam, customStart, customEnd });
  const { data: agentsData, isLoading: isLoadingAgents } = useGetSalesByAgentReportQuery({ range: rangeParam, customStart, customEnd });
  const { data: entryHistoryData, isLoading: isLoadingHistory } = useGetSalesEntryHistoryQuery({ range: rangeParam, customStart, customEnd });
  const { data: recipientsData, isLoading: isLoadingRecipients } = useGetRecipientsQuery();
  const { data: reportHistoryData, isLoading: isLoadingReportHistory } = useGetReportHistoryQuery();

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

  const handleCustomRangeApply = (start: string, end: string) => {
    // Format dates to short strings, e.g. "Aug 1 - Aug 15"
    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };
    setCustomStart(start);
    setCustomEnd(end);
    setCustomRangeLabel(`${formatDate(start)} - ${formatDate(end)}`);
    setActiveTab("Custom Range");
  };

  const handleInitialExportClick = async () => {
    try {
      await generateAndEmailReport().unwrap();
      toast.success("Report generated and emailed successfully!");
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to generate report");
    }
  };

  const handleCloseDayConfirm = async () => {
    try {
      await toggleReport(false).unwrap();
      await refetchMe();
      setIsCloseModalOpen(false);
      toast.success("Day closed! Automatic reports disabled.");
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to close day");
    }
  };

  const handleStartNewDay = async () => {
    try {
      await toggleReport(true).unwrap();
      await refetchMe();
      toast.success("New day started! Board is active.");
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to start new day");
    }
  };

  const handleResend = async (id: number) => {
    try {
      await generateAndEmailReport().unwrap();
      toast.success("Report resent successfully!");
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to resend report");
    }
  };

  const handleDownloadPDF = () => {
    if (!agents || agents.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const teamTotal = summary?.teamTotal || 0;
    const remainingToGoal = Math.max(0, monthlyGoal - teamTotal);

    const doc = new jsPDF();
    
    // Theme Colors
    const primaryColor: [number, number, number] = [82, 82, 255]; // #5252ff
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text("ROBPADEN SALES REPORT", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Office / Company: ${companyName}`, 14, 30);
    doc.text(`Manager: ${managerName}`, 14, 35);
    doc.text(`Report Period: ${activeTab}`, 14, 40);
    doc.text(`Date Generated: ${new Date().toLocaleString()}`, 14, 45);

    // Summary Box
    doc.setDrawColor(...primaryColor);
    doc.setFillColor(245, 245, 255);
    doc.roundedRect(14, 55, 182, 25, 3, 3, "FD");
    
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text("PERFORMANCE SUMMARY", 18, 62);
    
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text(`Total Sales: ${teamTotal}`, 18, 72);
    
    doc.setTextColor(50, 50, 50);
    doc.text(`Agents: ${summary?.activeAgents || 0}`, 70, 72);
    doc.text(`Goal: ${monthlyGoal}`, 110, 72);
    doc.text(`Remaining: ${remainingToGoal}`, 150, 72);

    // Agents Table
    const tableColumn = ["Agent Name", "Daily Sales", "Weekly Sales", "Daily Rank", "Weekly Rank", "Corrections"];
    const tableRows = agents.map((agent: any) => [
      agent.name,
      agent.daily,
      agent.weekly,
      `#${agent.dailyRank}`,
      `#${agent.weeklyRank}`,
      agent.corrections || "None"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    doc.save(`robpaden_report_${activeTab.replace(" ", "_").toLowerCase()}.pdf`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-zinc-50">
      <Header 
        title="Reports" 
        action={
          !isReportGenerationActive ? (
            <button 
              onClick={handleStartNewDay}
              disabled={isToggling}
              className="bg-[#10b981] cursor-pointer hover:bg-[#059669] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
            >
              {isToggling ? "Starting..." : "Start New Day"}
            </button>
          ) : (
            <button 
              onClick={() => setIsCloseModalOpen(true)}
              className="bg-[#5252ff] cursor-pointer hover:bg-[#4242e5] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
            >
              <span className="hidden md:inline">Close Day and Email Report</span>
              <span className="md:hidden">Close Day</span>
            </button>
          )
        }
      />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 mx-auto w-full">
      {/* Tabs and Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-8 border-b border-zinc-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {["Today", "This Week", "This Month", "Custom Range"].map((tab) => {
            const isCustom = tab === "Custom Range";
            const displayLabel = isCustom ? customRangeLabel : tab;
            
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-1.5 cursor-pointer rounded-md text-[13px] font transition-colors ${
                  activeTab === tab
                    ? "bg-[#5252ff] text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="text-[#5252ff] cursor-pointer hover:text-[#4242e5] text-[13px] font-semibold transition-colors ml-4 flex items-center gap-2"
        >
          Export PDF Report
        </button>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
          <p className="text-[12px] font-medium text-zinc-500 mb-2">Team Total (Period)</p>
          <div className="flex items-end gap-2 h-[34px]">
            {isLoadingSummary ? (
              <div className="w-16 h-8 bg-zinc-100 rounded animate-pulse"></div>
            ) : (
              <span className="text-3xl font-bold text-zinc-900 leading-none">{summary?.teamTotal || 0}</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">{summary?.activeAgents || 0} agents</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
          <p className="text-[12px] font-medium text-zinc-500 mb-2">Average Daily Sales</p>
          <div className="flex items-end gap-2 h-[34px]">
            {isLoadingSummary ? (
              <div className="w-16 h-8 bg-zinc-100 rounded animate-pulse"></div>
            ) : (
              <span className="text-3xl font-bold text-zinc-900 leading-none">{summary?.averageDailySales || 0}</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">past 7 days</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
          <p className="text-[12px] font-medium text-zinc-500 mb-2">Best Day</p>
          <div className="flex items-end gap-2 h-[34px]">
            {isLoadingSummary ? (
              <div className="w-16 h-8 bg-zinc-100 rounded animate-pulse"></div>
            ) : (
              <span className="text-3xl font-bold text-zinc-900 leading-none">{summary?.bestDay?.count || 0}</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">{summary?.bestDay?.date || "No sales yet"}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
          <p className="text-[12px] font-medium text-zinc-500 mb-2">Top Agent</p>
          <div className="flex flex-col justify-center h-[34px]">
            {isLoadingSummary ? (
              <div className="w-32 h-6 bg-zinc-100 rounded animate-pulse"></div>
            ) : (
              <span className="text-[22px] font-bold text-zinc-400 leading-tight">
                {summary?.topAgent?.name || "None"}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            {summary?.topAgent ? `${summary.topAgent.salesCount} sales ${activeTab.toLowerCase()}` : "Waiting for first sale"}
          </p>
        </div>
      </div>

      {/* Tables and Forms */}
      <SalesByAgentTable isLoading={isLoadingAgents} agents={agents} />
      <ReportHistoryTable 
        isLoading={isLoadingReportHistory} 
        isExporting={isGenerating} 
        onExportClick={handleInitialExportClick}
        onResendClick={handleResend}
        reportHistory={reportHistory} 
      />
      <EmailRecipientsBlock isLoading={isLoadingRecipients} recipients={recipients} />
      <SalesEntryHistoryTable isLoading={isLoadingHistory} entryHistory={entryHistory} />

      {/* Modals */}
      <CloseDayModal 
        isOpen={isCloseModalOpen} 
        onClose={() => setIsCloseModalOpen(false)} 
        onConfirm={handleCloseDayConfirm}
        isGenerating={isGenerating}
      />
      <CustomDateRangeModal
        isOpen={isCustomRangeModalOpen}
        onClose={() => setIsCustomRangeModalOpen(false)}
        onApply={handleCustomRangeApply}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onDownload={handleDownloadPDF}
      />
      </div>
    </div>
  );
}
