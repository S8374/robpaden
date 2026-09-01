import React, { useState } from "react";
import { useGetManagerActivityTimelineQuery } from "@/redux/api/user.api";
import { useRouter } from "next/navigation";
import { Calendar, User as UserIcon, BarChart, Calendar as CalendarIcon, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ManagerActivityTimelineProps {
  managerId: number;
  selectedMonth?: number;
  selectedYear?: number;
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
}

export function ManagerActivityTimeline({ 
  managerId,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange
}: ManagerActivityTimelineProps) {
  const { data, isLoading } = useGetManagerActivityTimelineQuery({ 
    id: managerId,
    month: selectedMonth,
    year: selectedYear
  });
  
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Construct a Date object from the passed month/year (default to current if not provided)
  const currentMonth = selectedMonth ? selectedMonth - 1 : new Date().getMonth();
  const currentYearSelected = selectedYear || new Date().getFullYear();
  const selectedDate = new Date(currentYearSelected, currentMonth, 1);

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

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500">Loading timeline...</div>;
  }

  const timeline = data?.data || [];

  const grouped = timeline.reduce((acc: any, item: any) => {
    const d = new Date(item.date);
    const dateStr = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    if (!acc[dateStr]) acc[dateStr] = {};
    if (!acc[dateStr][item.agentId]) {
      acc[dateStr][item.agentId] = {
        agentName: item.agentName,
        agentId: item.agentId,
        actions: []
      };
    }
    acc[dateStr][item.agentId].actions.push(item);
    return acc;
  }, {});

  // Generate all days in the selected month in ascending order
  const daysInMonth = new Date(currentYearSelected, currentMonth + 1, 0).getDate();
  const monthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentYearSelected, currentMonth, i);
    const dateStr = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    monthDays.push(dateStr);
  }

  // Pagination logic
  const totalPages = Math.ceil(monthDays.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDays = monthDays.slice(startIndex, endIndex);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm md:col-span-2">
      <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-zinc-900">Activity History</h3>
        </div>
        
        {onMonthChange && onYearChange && (
          <div className="flex items-center gap-2 relative">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => {
                if (date) {
                  onMonthChange(date.getMonth() + 1);
                  onYearChange(date.getFullYear());
                  setCurrentPage(1); // Reset page on month change
                }
              }}
              dateFormat="MMMM yyyy"
              showMonthYearPicker={true}
              showPopperArrow={true}
              customInput={<CustomInput />}
              popperClassName="z-[9999]"
              portalId="root-portal"
            />
          </div>
        )}
      </div>

      <div className="p-5 space-y-8 max-h-[600px] overflow-y-auto">
        <div className="space-y-8">
          {paginatedDays.map((dateStr) => {
            const agents = grouped[dateStr];
            
            return (
              <div key={dateStr} className="space-y-4">
                <div className="sticky top-0 bg-white z-20 pb-2 border-b border-zinc-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <h4 className="font-bold text-zinc-800 text-sm">{dateStr}</h4>
                </div>
                
                <div className="space-y-3 pl-2">
                  {!agents || Object.keys(agents).length === 0 ? (
                    <div className="py-4 text-sm text-zinc-400 font-medium bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200 text-center">
                      No records found
                    </div>
                  ) : (
                    Object.values(agents).map((agentGroup: any) => (
                      <details key={agentGroup.agentId} className="group bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-zinc-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold uppercase text-xs">
                              {agentGroup.agentName.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-900">{agentGroup.agentName}</p>
                              <p className="text-xs text-zinc-500">{agentGroup.actions.length} action{agentGroup.actions.length !== 1 ? 's' : ''} recorded</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={(e) => {
                                e.preventDefault(); // prevent expanding the details tag
                                router.push(`/dashboard/manager-management/${agentGroup.agentId}`);
                              }}
                              className="text-xs px-3 py-1.5 bg-white border border-zinc-200 shadow-sm rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer"
                            >
                              See Details
                            </button>
                            <div className="text-zinc-400 group-open:rotate-180 transition-transform duration-200">
                              ▼
                            </div>
                          </div>
                        </summary>
                        
                        <div className="p-4 border-t border-zinc-200 bg-white space-y-4">
                          {agentGroup.actions.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 relative">
                              {idx !== agentGroup.actions.length - 1 && (
                                <div className="absolute left-3.5 top-7 bottom-[-20px] w-[2px] bg-zinc-100"></div>
                              )}
                              
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] ${
                                item.type === 'SALE' ? (item.action === 'REVERSED' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600') : 
                                (item.action === 'AGENT_DEACTIVATED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')
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
                                  <div className="mt-1.5 p-2.5 bg-zinc-50 rounded-lg text-xs text-zinc-600 border border-zinc-100 inline-block">
                                    {item.action === 'ADDED' ? <span className="font-medium text-emerald-600">Count: +{item.details.newAmount}</span> : 
                                     item.action === 'EDITED' ? <span>Changed from <span className="font-medium line-through text-zinc-400">{item.details.previousAmount}</span> to <span className="font-medium text-blue-600">{item.details.newAmount}</span></span> :
                                     <span className="font-medium text-red-600">Reversed count: -{item.details.previousAmount}</span>}
                                  </div>
                                )}
                                
                                {item.type === 'AGENT' && item.details?.note && (
                                  <div className="mt-1.5 p-2.5 bg-zinc-50 rounded-lg text-xs text-zinc-600 border border-zinc-100">
                                    {item.details.note}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Controls */}
      {monthDays.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-white">
          <span className="text-sm text-zinc-500">
            Showing <span className="font-medium text-zinc-900">{startIndex + 1}</span> to <span className="font-medium text-zinc-900">{Math.min(endIndex, monthDays.length)}</span> of <span className="font-medium text-zinc-900">{monthDays.length}</span> entries
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
