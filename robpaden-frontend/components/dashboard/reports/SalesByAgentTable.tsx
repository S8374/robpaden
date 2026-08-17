export function SalesByAgentTable({ isLoading }: { isLoading?: boolean }) {
  const mockData = [
    { id: 1, initials: "AB", name: "Jordan Lee", daily: 24, weekly: 128, dailyRank: "#1", weeklyRank: "#1", corrections: "None" },
    { id: 2, initials: "AB", name: "Sam Patel", daily: 22, weekly: 118, dailyRank: "#2", weeklyRank: "#2", corrections: "None" },
    { id: 3, initials: "AB", name: "Casey Kim", daily: 19, weekly: 101, dailyRank: "#3", weeklyRank: "#3", corrections: "1 reversed (2:30 PM)", hasReversal: true },
    { id: 4, initials: "AB", name: "Riley Chen", daily: 16, weekly: 90, dailyRank: "#4", weeklyRank: "#4", corrections: "None" },
    { id: 5, initials: "AB", name: "Morgan Diaz", daily: 14, weekly: 78, dailyRank: "#5", weeklyRank: "#5", corrections: "None" },
    { id: 6, initials: "AB", name: "Avery Brooks", daily: 11, weekly: 60, dailyRank: "#6", weeklyRank: "#6", corrections: "None" },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-[15px] font-bold text-zinc-900 mb-4 tracking-tight">Sales by Agent</h3>
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        
        {/* Mobile View: Cards */}
        <div className="flex flex-col xl:hidden divide-y divide-zinc-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-mob-${i}`} className="p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100"></div>
                  <div className="w-32 h-4 bg-zinc-100 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="h-12 bg-zinc-100 rounded-lg"></div>
                  <div className="h-12 bg-zinc-100 rounded-lg"></div>
                </div>
                <div className="h-4 w-48 bg-zinc-100 rounded"></div>
              </div>
            ))
          ) : (
            mockData.map((agent) => (
              <div key={`mob-${agent.id}`} className="p-4 hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0f4ff] text-[#5252ff] flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                    {agent.initials}
                  </div>
                  <span className="font-semibold text-zinc-900 text-[15px]">{agent.name}</span>
                </div>
                
                <div className="flex bg-zinc-50 rounded-xl p-3 mb-4">
                  <div className="flex-1 text-center border-r border-zinc-200">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Daily ({agent.dailyRank})</p>
                    <p className="text-xl font-bold text-zinc-900">{agent.daily}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Weekly ({agent.weeklyRank})</p>
                    <p className="text-xl font-bold text-zinc-500">{agent.weekly}</p>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase mr-2">Corrections:</span>
                  <span className={agent.hasReversal ? "text-amber-600 font-medium" : "text-zinc-500"}>
                    {agent.corrections}
                  </span>
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
              <th className="px-6 py-4">AGENT</th>
              <th className="px-6 py-4 text-center">DAILY</th>
              <th className="px-6 py-4 text-center">WEEKLY</th>
              <th className="px-6 py-4 text-center">DAILY RANK</th>
              <th className="px-6 py-4 text-center">WEEKLY RANK</th>
              <th className="px-6 py-4">CORRECTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 shrink-0"></div>
                      <div className="w-32 h-4 bg-zinc-100 rounded"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-8 h-4 bg-zinc-100 rounded mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-8 h-4 bg-zinc-100 rounded mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-6 h-4 bg-zinc-100 rounded mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-6 h-4 bg-zinc-100 rounded mx-auto"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-12 h-4 bg-zinc-100 rounded"></div>
                  </td>
                </tr>
              ))
            ) : (
              mockData.map((agent) => (
                <tr key={agent.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-[#f0f4ff] text-[#5252ff] flex items-center justify-center font-bold text-[13px] shrink-0">
                        {agent.initials}
                      </div>
                      <span className="font-semibold text-zinc-900 text-[14px]">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-zinc-900 text-[15px]">
                    {agent.daily}
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-500 font-medium">
                    {agent.weekly}
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-500 text-xs font-semibold">
                    {agent.dailyRank}
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-500 text-xs font-semibold">
                    {agent.weeklyRank}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium">
                    <span className={agent.hasReversal ? "text-[#e11d48]" : "text-zinc-500"}>
                      {agent.corrections}
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
