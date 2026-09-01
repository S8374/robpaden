import React, { useState } from "react";
import { Activity, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SalesHistoryTableProps {
  salesHistory: any[];
  selectedMonth?: number;
  selectedYear?: number;
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
}

export function SalesHistoryTable({ 
  salesHistory, 
  selectedMonth, 
  selectedYear, 
  onMonthChange, 
  onYearChange 
}: SalesHistoryTableProps) {
  const data = salesHistory || [];
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

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
              showPopperArrow={true}
              customInput={<CustomInput />}
              popperClassName="z-[9999]"
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
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                  No sales history generated yet.
                </td>
              </tr>
            ) : (
              currentData.map((record: any, idx: number) => {
                const percentage = record.percentage || 0;
                
                return (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 text-zinc-500 font-medium">
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
                  </tr>
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
