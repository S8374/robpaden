import React, { useState } from "react";
import { Activity, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, Loader2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useGetManagerActivityTimelineQuery } from "@/redux/api/user.api";
import { User as UserIcon, BarChart } from "lucide-react";
import { useRouter } from "next/navigation";

interface SalesHistoryTableProps {
  salesHistory: any[];
  reportHistory?: any[];
  managerId: number;
  selectedMonth?: number;
  selectedYear?: number;
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
}

export function SalesHistoryTable({ 
  salesHistory, 
  reportHistory,
  managerId,
  selectedMonth, 
  selectedYear, 
  onMonthChange, 
  onYearChange 
}: SalesHistoryTableProps) {
  const data = salesHistory || [];
  const router = useRouter();

  // Fetch activity timeline data
  const { data: activityData, isLoading: isLoadingActivity } = useGetManagerActivityTimelineQuery({ 
    id: managerId,
    month: selectedMonth,
    year: selectedYear
  });

  const timeline = activityData?.data || [];
  const groupedActivity = React.useMemo(() => {
    return timeline.reduce((acc: any, item: any) => {
      const d = new Date(item.date);
      // Group by local date string to match record dates robustly
      const dateKey = d.toLocaleDateString('en-US');
      
      if (!acc[dateKey]) acc[dateKey] = {};
      if (!acc[dateKey][item.agentId]) {
        acc[dateKey][item.agentId] = {
          agentName: item.agentName,
          agentId: item.agentId,
          actions: []
        };
      }
      acc[dateKey][item.agentId].actions.push(item);
      return acc;
    }, {});
  }, [timeline]);

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  const toggleRow = (idx: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };
  
  const getFormattedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const datesWithReports = React.useMemo(() => {
    const map = new Map<string, string | null>();
    if (reportHistory) {
      reportHistory.forEach(r => {
        if (r.status === 'Sent' || r.status === 'CONFIRMED' || r.date) {
          map.set(getFormattedDate(r.date), r.pdfUrl || null);
        }
      });
    }
    return map;
  }, [reportHistory]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingDate, setDownloadingDate] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handleDownload = (dateStr: string) => {
    const formattedDate = getFormattedDate(dateStr);
    const pdfUrl = datesWithReports.get(formattedDate);
    
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      alert("This report is from an older version and does not have a downloadable PDF URL saved.");
    }
  };

  // Construct a Date object from the passed month/year (default to current if not provided)
  const currentMonth = selectedMonth ? selectedMonth - 1 : new Date().getMonth();
  const currentYear = selectedYear || new Date().getFullYear();
  const selectedDate = new Date(currentYear, currentMonth, 1);

  // Custom Input for the DatePicker to match the professional but normal design
  const CustomInput = React.forwardRef(({ value, onClick }: any, ref: any) => (
    <button
      className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors focus:outline-none"
      onClick={onClick}
      ref={ref}
    >
      <CalendarIcon className="w-4 h-4 text-zinc-500" />
      {value}
    </button>
  ));
  CustomInput.displayName = "CustomInput";

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm md:col-span-2">
      <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-zinc-900">Monthly Sales History</h3>
        </div>
        
        {onMonthChange && onYearChange && (
          <div className="flex items-center gap-2 relative">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => {
                if (date) {
                  onMonthChange(date.getMonth() + 1);
                  onYearChange(date.getFullYear());
                  setCurrentPage(1);
                }
              }}
              dateFormat="MMMM yyyy"
              showMonthYearPicker={true}
              renderCustomHeader={({
                date,
                prevYearButtonDisabled,
                nextYearButtonDisabled,
              }) => (
                <div className="flex justify-between items-center px-2 py-1 border-b border-zinc-100 mb-2">
                  <button
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      if (onYearChange) onYearChange(date.getFullYear() - 1); 
                    }}
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors cursor-pointer"
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-zinc-800 text-sm">
                    {date.getFullYear()}
                  </span>
                  <button
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      if (onYearChange) onYearChange(date.getFullYear() + 1); 
                    }}
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors cursor-pointer"
                    type="button"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
              customInput={<CustomInput />}
              popperClassName="!z-[9999]"
              portalId="root-portal"
            />
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50/50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Date</th>
              <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Sales Count</th>
              <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Target Completion</th>
              <th className="px-6 py-4 tracking-wider border-b border-zinc-100 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                  No sales history generated yet.
                </td>
              </tr>
            ) : (
              currentData.map((record: any, idx: number) => {
                const percentage = record.percentage || 0;
                
                return (
                  <React.Fragment key={idx}>
                    <tr onClick={() => toggleRow(idx)} className="hover:bg-zinc-50/50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4 text-zinc-500 font-medium flex items-center gap-2">
                        <div className={`transform transition-transform duration-200 ${expandedRows.has(idx) ? 'rotate-90' : ''}`}>
                          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                        </div>
                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full">
                        {record.salesCount} <span className="text-zinc-400 text-[11px] font-medium ml-1">/ {record.target || 0}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 w-[35%]">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${percentage >= 100 ? 'bg-emerald-500' : (percentage > 0 ? 'bg-indigo-500' : 'bg-transparent')}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${percentage >= 100 ? 'text-emerald-600' : 'text-zinc-500'}`}>
                          {percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {datesWithReports.has(getFormattedDate(record.date)) ? (
                        <button
                          onClick={() => handleDownload(record.date)}
                          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-zinc-400 text-[11px] font-medium uppercase">
                            Report Not Found
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                  
                  {/* Expandable Activity Content */}
                  {expandedRows.has(idx) && (
                    <tr className="bg-zinc-50/30">
                      <td colSpan={4} className="p-0 border-b border-zinc-100">
                        <div className="px-10 py-6">
                          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Activity Timeline</h4>
                          
                          {isLoadingActivity ? (
                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                              <Loader2 className="w-4 h-4 animate-spin" /> Loading activities...
                            </div>
                          ) : !groupedActivity[new Date(record.date).toLocaleDateString('en-US')] ? (
                            <div className="py-4 text-sm text-zinc-400 font-medium bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200 text-center">
                              No activity recorded on this day.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {Object.values(groupedActivity[new Date(record.date).toLocaleDateString('en-US')]).map((agentGroup: any) => (
                                <details key={agentGroup.agentId} className="group/agent bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                                  <summary className="flex items-center justify-between p-3 cursor-pointer list-none hover:bg-zinc-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold uppercase text-xs">
                                        {agentGroup.agentName.substring(0, 2)}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-zinc-900 text-sm">{agentGroup.agentName}</p>
                                        <p className="text-xs text-zinc-500">{agentGroup.actions.length} action{agentGroup.actions.length !== 1 ? 's' : ''}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <button 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          router.push(`/dashboard/manager-management/${agentGroup.agentId}`);
                                        }}
                                        className="text-xs px-3 py-1.5 bg-white border border-zinc-200 shadow-sm rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer"
                                      >
                                        See Details
                                      </button>
                                      <div className="text-zinc-400 group-open/agent:rotate-180 transition-transform duration-200 mr-2">
                                        ▼
                                      </div>
                                    </div>
                                  </summary>
                                  
                                  <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 space-y-4">
                                    {agentGroup.actions.map((item: any, aIdx: number) => (
                                      <div key={aIdx} className="flex gap-4 relative">
                                        {aIdx !== agentGroup.actions.length - 1 && (
                                          <div className="absolute left-3.5 top-7 bottom-[-20px] w-[2px] bg-zinc-200"></div>
                                        )}
                                        
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] ${
                                          item.type === 'SALE' ? (item.action === 'REVERSED' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100') : 
                                          (item.action === 'AGENT_DEACTIVATED' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100')
                                        }`}>
                                          {item.type === 'SALE' ? <BarChart className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                                        </div>
                                        
                                        <div className="flex-1 pb-1">
                                          <div className="flex justify-between items-start">
                                            <p className="text-sm font-semibold text-zinc-900">
                                              {item.type === 'SALE' ? (
                                                item.action === 'ADDED' ? 'Added sales' : 
                                                item.action === 'EDITED' ? 'Edited sales' : 'Reversed sales'
                                              ) : (
                                                item.action === 'AGENT_ADDED' ? 'Added agent' :
                                                item.action === 'AGENT_UPDATED' ? 'Updated profile' :
                                                item.action === 'AGENT_DEACTIVATED' ? 'Deactivated agent' : 'Activated agent'
                                              )}
                                            </p>
                                            <span className="text-xs text-zinc-400 font-medium">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                          </div>
                                          
                                          {item.type === 'SALE' && item.details && (
                                            <div className="mt-1.5 p-2 bg-white rounded-lg text-xs text-zinc-600 border border-zinc-200 inline-block shadow-sm">
                                              {item.action === 'ADDED' ? <span className="font-medium text-emerald-600">Count: +{item.details.newAmount}</span> : 
                                               item.action === 'EDITED' ? <span>Changed from <span className="font-medium line-through text-zinc-400">{item.details.previousAmount}</span> to <span className="font-medium text-blue-600">{item.details.newAmount}</span></span> :
                                               <span className="font-medium text-red-600">Reversed count: -{item.details.previousAmount}</span>}
                                            </div>
                                          )}
                                          
                                          {item.type === 'AGENT' && item.details?.note && (
                                            <div className="mt-1.5 p-2 bg-white rounded-lg text-xs text-zinc-600 border border-zinc-200 shadow-sm">
                                              {item.details.note}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-white">
          <span className="text-sm text-zinc-500">
            Showing <span className="font-medium text-zinc-900">{startIndex + 1}</span> to <span className="font-medium text-zinc-900">{Math.min(endIndex, data.length)}</span> of <span className="font-medium text-zinc-900">{data.length}</span> entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                }
                if (pageNum === null) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum as number)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 text-white border border-blue-600' 
                        : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
