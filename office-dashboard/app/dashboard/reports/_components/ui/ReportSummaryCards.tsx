import React from "react";

interface ReportSummaryCardsProps {
  summary: any;
  isLoadingSummary: boolean;
  activeTab: string;
}

export function ReportSummaryCards({ summary, isLoadingSummary, activeTab }: ReportSummaryCardsProps) {
  return (
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
  );
}
