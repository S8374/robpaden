"use client";

import { Header } from "@/components/dashboard/layout/Header";
import { SalesByAgentTable } from "./_components/tables/SalesByAgentTable";
import { ReportHistoryTable } from "./_components/tables/ReportHistoryTable";
import { EmailRecipientsBlock } from "./_components/ui/EmailRecipientsBlock";
import { SalesEntryHistoryTable } from "./_components/tables/SalesEntryHistoryTable";
import { CustomDateRangeModal } from "./_components/modals/CustomDateRangeModal";
import { ExportModal } from "./_components/modals/ExportModal";
import { ReportSummaryCards } from "./_components/ui/ReportSummaryCards";
import { ReportTabs } from "./_components/ui/ReportTabs";
import { useReports } from "./_hooks/useReports";

export default function ReportsPage() {
  const { state, data, actions } = useReports();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-zinc-50">
      <Header 
        title="Reports" 
        dateLabel={state.activeTab === "Custom Range" ? state.customRangeLabel : undefined}
        action={
          <button 
            onClick={actions.handleInitialExportClick}
            disabled={state.isGenerating}
            className="bg-[#5252ff] cursor-pointer hover:bg-[#4242e5] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-colors shadow-sm whitespace-nowrap disabled:opacity-50 flex items-center justify-center min-w-[140px] gap-2"
          >
            {state.isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              "Email Report Now"
            )}
          </button>
        }
      />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 mx-auto w-full">
        {/* Tabs and Actions */}
        <ReportTabs 
          activeTab={state.activeTab}
          customRangeLabel={state.customRangeLabel}
          handleTabClick={actions.handleTabClick}
          onExportClick={() => actions.setIsExportModalOpen(true)}
        />

        {/* Summary Cards */}
        <ReportSummaryCards 
          summary={data.summary}
          isLoadingSummary={state.isLoadingSummary}
          activeTab={state.activeTab}
        />

        {/* Tables and Forms */}
        <SalesByAgentTable isLoading={state.isLoadingAgents} agents={data.agents} />
        <ReportHistoryTable 
          isLoading={state.isLoadingReportHistory} 
          isExporting={state.isGenerating} 
          onExportClick={actions.handleInitialExportClick}
          onResendClick={actions.handleResend}
          reportHistory={data.reportHistory} 
        />
        <EmailRecipientsBlock isLoading={state.isLoadingRecipients} recipients={data.recipients} />
        <SalesEntryHistoryTable isLoading={state.isLoadingHistory} entryHistory={data.entryHistory} />

        {/* Modals */}
        <CustomDateRangeModal
          isOpen={state.isCustomRangeModalOpen}
          onClose={() => actions.setIsCustomRangeModalOpen(false)}
          onApply={actions.handleCustomRangeApply}
        />
        <ExportModal
          isOpen={state.isExportModalOpen}
          onClose={() => actions.setIsExportModalOpen(false)}
          onDownload={actions.handleDownloadPDF}
        />
      </div>
    </div>
  );
}
