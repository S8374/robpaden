interface ReportHistoryTableProps {
  isLoading?: boolean;
  isExporting?: boolean;
  onExportClick?: () => void;
}

export function ReportHistoryTable({ isLoading, isExporting, onExportClick }: ReportHistoryTableProps) {
  const mockHistory = [
    { id: 1, date: "Wed, Aug 5, 2026", sentTo: "rob@officea.com, ops@officea.com", status: "Sent" },
    { id: 2, date: "Tue, Aug 4, 2026", sentTo: "rob@officea.com, ops@officea.com", status: "Sent" },
    { id: 3, date: "Mon, Aug 3, 2026", sentTo: "rob@offices.com", status: "Failed" },
  ];

  return (
    <div className="mt-8 mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h3 className="text-[15px] font-bold text-zinc-900 tracking-tight">Report History</h3>
        <div className="flex items-center gap-4">
          <input 
            type="date" 
            className="w-[160px] px-3 py-1.5 cursor-pointer text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all text-zinc-600"
          />
          <button 
            onClick={onExportClick}
            disabled={isExporting}
            className={`text-[13px] cursor-pointer font-semibold transition-colors flex items-center gap-2 ${
              isExporting ? "text-zinc-400 cursor-not-allowed" : "text-[#5252ff] hover:text-[#4242e5]"
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              "Generate Report"
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        
        {/* Mobile View: Cards */}
        <div className="flex flex-col xl:hidden divide-y divide-zinc-100">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-mob-${i}`} className="p-4 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-32 h-4 bg-zinc-100 rounded"></div>
                  <div className="w-12 h-6 bg-zinc-100 rounded-md"></div>
                </div>
                <div className="w-48 h-3 bg-zinc-100 rounded mb-4"></div>
                <div className="w-16 h-4 bg-zinc-100 rounded"></div>
              </div>
            ))
          ) : (
            mockHistory.map((report) => (
              <div key={`mob-${report.id}`} className="p-4 hover:bg-zinc-50/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-zinc-900 text-sm">{report.date}</span>
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    report.status === "Sent" 
                      ? "bg-[#e5fcf1] text-[#1f9d55]" 
                      : "bg-[#ffe5e5] text-[#d62828]"
                  }`}>
                    {report.status}
                  </span>
                </div>
                <div className="text-[13px] text-zinc-500 mb-3 break-all">
                  <span className="font-semibold text-zinc-400 uppercase text-[10px] block mb-0.5">Sent To:</span>
                  {report.sentTo}
                </div>
                <div className="flex justify-end">
                  <button className="bg-[#f0f4ff] hover:bg-[#e0e7ff] text-[#5252ff] px-4 py-2 rounded-lg font-semibold text-[13px] transition-colors shadow-sm">
                    Resend
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
          <thead className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">REPORT DATE</th>
              <th className="px-6 py-4">SENT TO</th>
              <th className="px-6 py-4">STATUS</th>
              <th className="px-6 py-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="w-24 h-4 bg-zinc-100 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-48 h-4 bg-zinc-100 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-12 h-6 bg-zinc-100 rounded-md"></div>
                  </td>
                  <td className="px-6 py-4 flex justify-end">
                    <div className="w-12 h-4 bg-zinc-100 rounded"></div>
                  </td>
                </tr>
              ))
            ) : (
              mockHistory.map((report) => (
                <tr key={report.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-zinc-900 text-[13px]">
                    {report.date}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-[13px]">
                    {report.sentTo}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      report.status === "Sent" 
                        ? "bg-[#e5fcf1] text-[#1f9d55]" 
                        : "bg-[#ffe5e5] text-[#d62828]"
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#5252ff] cursor-pointer hover:text-[#4242e5] font-semibold text-[13px] transition-colors">
                      Resend
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
