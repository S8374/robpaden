export function SalesEntryHistoryTable({ isLoading }: { isLoading?: boolean }) {
  const mockEntries = [
    { id: 1, time: "2:41 PM", agentInitials: "AB", agentName: "Jordan Lee", count: 1, enteredBy: "Rob Paden", status: "Confirmed" },
    { id: 2, time: "2:38 PM", agentInitials: "AB", agentName: "Sam Patel", count: 1, enteredBy: "Rob Paden", status: "Confirmed" },
    { id: 3, time: "2:30 PM", agentInitials: "AB", agentName: "Casey Kim", count: 1, enteredBy: "Rob Paden", status: "Reversed" },
    { id: 4, time: "2:22 PM", agentInitials: "AB", agentName: "Riley Chen", count: 1, enteredBy: "Rob Paden", status: "Confirmed" },
    { id: 5, time: "1:15 PM", agentInitials: "AB", agentName: "Jordan Lee", count: 2, enteredBy: "Rob Paden", status: "Confirmed" },
    { id: 6, time: "12:47 PM", agentInitials: "AB", agentName: "Morgan Diaz", count: 1, enteredBy: "Casey Kim (Manager)", status: "Confirmed" },
    { id: 7, time: "11:02 AM", agentInitials: "AB", agentName: "Jordan Lee", count: 1, enteredBy: "Casey Kim (Manager)", status: "Reversed" },
  ];

  return (
    <div className="mt-8 mb-12">
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-zinc-900 tracking-tight">Sales Entry History</h3>
        <p className="text-[13px] text-zinc-500 mt-1">Every individual transaction, including corrections and reversals.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        
        {/* Mobile View: Cards */}
        <div className="flex flex-col xl:hidden divide-y divide-zinc-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-mob-${i}`} className="p-4 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100"></div>
                    <div className="w-24 h-4 bg-zinc-100 rounded"></div>
                  </div>
                  <div className="w-16 h-6 bg-zinc-100 rounded-md"></div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="w-16 h-3 bg-zinc-100 rounded"></div>
                  <div className="w-8 h-4 bg-zinc-100 rounded"></div>
                </div>
                <div className="w-32 h-3 bg-zinc-100 rounded"></div>
              </div>
            ))
          ) : (
            mockEntries.map((entry) => (
              <div key={`mob-${entry.id}`} className="p-4 hover:bg-zinc-50/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f0f4ff] text-[#5252ff] flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                      {entry.agentInitials}
                    </div>
                    <span className="font-semibold text-zinc-900 text-[14px]">{entry.agentName}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    entry.status === "Confirmed" 
                      ? "bg-[#e5fcf1] text-[#1f9d55]" 
                      : "bg-[#ffe5e5] text-[#d62828]"
                  }`}>
                    {entry.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-zinc-50 rounded-lg p-2.5 mb-2 border border-zinc-100">
                  <span className="text-[12px] font-medium text-zinc-500">{entry.time}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Count:</span>
                    <span className="font-bold text-zinc-900 text-[14px]">{entry.count}</span>
                  </div>
                </div>

                <div className="text-[12px] text-zinc-500 break-all px-1">
                  <span className="font-semibold text-zinc-400 uppercase text-[10px] mr-1.5">Entered By:</span>
                  {entry.enteredBy}
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
              <th className="px-6 py-4">TIME</th>
              <th className="px-6 py-4">AGENT</th>
              <th className="px-6 py-4">COUNT</th>
              <th className="px-6 py-4">ENTERED BY</th>
              <th className="px-6 py-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="w-16 h-4 bg-zinc-100 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 shrink-0"></div>
                      <div className="w-24 h-4 bg-zinc-100 rounded"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-6 h-4 bg-zinc-100 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32 h-4 bg-zinc-100 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-6 bg-zinc-100 rounded-md"></div>
                  </td>
                </tr>
              ))
            ) : (
              mockEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 text-zinc-500 font-medium text-[13px]">
                    {entry.time}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#f0f4ff] text-[#5252ff] flex items-center justify-center font-bold text-[11px] shrink-0">
                        {entry.agentInitials}
                      </div>
                      <span className="font-semibold text-zinc-900 text-[13px]">{entry.agentName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900 text-[14px]">
                    {entry.count}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-[13px]">
                    {entry.enteredBy}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      entry.status === "Confirmed" 
                        ? "bg-[#e5fcf1] text-[#1f9d55]" 
                        : "bg-[#ffe5e5] text-[#d62828]"
                    }`}>
                      {entry.status}
                    </span>
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
