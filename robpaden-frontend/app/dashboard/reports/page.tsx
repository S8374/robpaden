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

export default function ReportsPage() {
  const [isDemoLoading, setIsDemoLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Today");
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isCustomRangeModalOpen, setIsCustomRangeModalOpen] = useState(false);
  const [customRangeLabel, setCustomRangeLabel] = useState("Custom Range");

  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDemoLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleTabClick = (tab: string) => {
    if (tab === "Custom Range") {
      setIsCustomRangeModalOpen(true);
    } else {
      setActiveTab(tab);
      setCustomRangeLabel("Custom Range"); // reset if they click something else
    }
  };

  const handleCustomRangeApply = (start: string, end: string) => {
    // Format dates to short strings, e.g. "Aug 1 - Aug 15"
    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };
    setCustomRangeLabel(`${formatDate(start)} - ${formatDate(end)}`);
    setActiveTab("Custom Range");
  };

  const handleInitialExportClick = () => {
    setIsExporting(true);
    // Simulate generation time before showing the modal
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(true);
    }, 1000);
  };

  const handleDownloadCSV = () => {
    // Dummy CSV data export
    const csvContent = "data:text/csv;charset=utf-8,AGENT,DAILY,WEEKLY,DAILY RANK,WEEKLY RANK\nJordan Lee,24,128,#1,#1\nSam Patel,22,118,#2,#2";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reports_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="h-full flex flex-col overflow-hidden bg-zinc-50">
      <Header 
        title="Reports" 
        action={
          <button 
            onClick={() => setIsCloseModalOpen(true)}
            className="bg-[#5252ff] cursor-pointer hover:bg-[#4242e5] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
          >
            <span className="hidden md:inline">Close Day and Email Report</span>
            <span className="md:hidden">Close Day</span>
          </button>
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
          onClick={handleInitialExportClick}
          disabled={isExporting}
          className={`text-[13px] cursor-pointer font-semibold transition-colors ml-4 flex items-center gap-2 ${
            isExporting ? "text-zinc-400 cursor-not-allowed" : "text-[#5252ff] hover:text-[#4242e5]"
          }`}
        >
          {isExporting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </>
          ) : (
            "Export Excel / CSV"
          )}
        </button>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
          <p className="text-[12px] font-medium text-zinc-500 mb-2">Team Total (Period)</p>
          <div className="flex items-end gap-2 h-[34px]">
            {isDemoLoading ? (
              <div className="w-16 h-8 bg-zinc-100 rounded animate-pulse"></div>
            ) : (
              <span className="text-3xl font-bold text-zinc-900 leading-none">119</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">12 agents</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
          <p className="text-[12px] font-medium text-zinc-500 mb-2">Average Daily Sales</p>
          <div className="flex items-end gap-2 h-[34px]">
            {isDemoLoading ? (
              <div className="w-16 h-8 bg-zinc-100 rounded animate-pulse"></div>
            ) : (
              <span className="text-3xl font-bold text-zinc-900 leading-none">97</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">past 7 days</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
          <p className="text-[12px] font-medium text-zinc-500 mb-2">Best Day</p>
          <div className="flex items-end gap-2 h-[34px]">
            {isDemoLoading ? (
              <div className="w-16 h-8 bg-zinc-100 rounded animate-pulse"></div>
            ) : (
              <span className="text-3xl font-bold text-zinc-900 leading-none">132</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">Tue, Aug 4</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
          <p className="text-[12px] font-medium text-zinc-500 mb-2">Top Agent</p>
          <div className="flex flex-col justify-center h-[34px]">
            {isDemoLoading ? (
              <div className="w-32 h-6 bg-zinc-100 rounded animate-pulse"></div>
            ) : (
              <span className="text-[22px] font-bold text-zinc-900 leading-tight">Jordan Lee</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">24 sales today</p>
        </div>
      </div>

      {/* Tables and Forms */}
      <SalesByAgentTable isLoading={isDemoLoading} />
      <ReportHistoryTable 
        isLoading={isDemoLoading} 
        isExporting={isExporting} 
        onExportClick={handleInitialExportClick} 
      />
      <EmailRecipientsBlock isLoading={isDemoLoading} />
      <SalesEntryHistoryTable isLoading={isDemoLoading} />

      {/* Modals */}
      <CloseDayModal 
        isOpen={isCloseModalOpen} 
        onClose={() => setIsCloseModalOpen(false)} 
        onConfirm={() => {
          // Add close day logic here
          setIsCloseModalOpen(false);
          toast.success("Day closed and reports emailed!");
        }}
      />
      <CustomDateRangeModal
        isOpen={isCustomRangeModalOpen}
        onClose={() => setIsCustomRangeModalOpen(false)}
        onApply={handleCustomRangeApply}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onDownload={handleDownloadCSV}
      />
      </div>
    </div>
  );
}
