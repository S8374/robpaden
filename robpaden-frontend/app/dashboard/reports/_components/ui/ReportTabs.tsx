import React from "react";

interface ReportTabsProps {
  activeTab: string;
  customRangeLabel: string;
  handleTabClick: (tab: string) => void;
  onExportClick: () => void;
}

export function ReportTabs({ activeTab, customRangeLabel, handleTabClick, onExportClick }: ReportTabsProps) {
  return (
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
        onClick={onExportClick}
        className="text-[#5252ff] cursor-pointer hover:text-[#4242e5] text-[13px] font-semibold transition-colors ml-4 flex items-center gap-2"
      >
        Export PDF Report
      </button>
    </div>
  );
}
