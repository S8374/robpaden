interface LeaderboardTableProps {
  activeAgents: any[];
}

export function LeaderboardTable({ activeAgents }: LeaderboardTableProps) {
  return (
    <div className="col-span-12 xl:col-span-7 border border-[#2d435d] rounded-[1.5rem] p-4 bg-[#141d2e] flex flex-col h-full overflow-hidden animate-panel-glow animate-shimmer">
      <h2 className="text-xl xl:text-2xl font-black text-center mb-6 tracking-widest text-white flex justify-center items-center uppercase">
        <img src="/images/icon/electric_icon.png" alt="Electric" className="w-6 h-6 xl:w-10 xl:h-10 object-contain mr-4" />
        TOP 10 LEADERBOARD
        <img src="/images/icon/electric_icon.png" alt="Electric" className="w-6 h-6 xl:w-10 xl:h-10 object-contain ml-4 transform scale-x-[-1]" />
      </h2>
      
      <div className="flex flex-col flex-1 bg-white rounded-2xl overflow-hidden shadow-inner">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-white text-[#2563eb] font-extrabold py-4 px-4 text-xs xl:text-sm uppercase text-center shrink-0 border-b-2 border-gray-100">
          <div className="col-span-1 flex items-center justify-center">#</div>
          <div className="col-span-5 flex items-center justify-start ml-6">REP NAME</div>
          <div className="col-span-2 flex items-center justify-center">TODAY</div>
          <div className="col-span-2 flex items-center justify-center">WEEKLY</div>
          <div className="col-span-2 flex items-center justify-center">MONTHLY</div>
        </div>
        
        {/* Table Body */}
        <div className="flex flex-col flex-1 bg-white py-2">
          {Array.from({ length: 10 }).map((_, i) => {
            const agent = activeAgents[i];
            return (
              <div key={i} className={`gsap-row grid grid-cols-12 items-center text-center text-xs xl:text-base font-bold flex-1 px-4 ${i !== 9 ? 'border-b border-gray-100' : ''}`}>
                
                {/* Number */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className={i < 3 ? "text-[#eab308] font-black text-lg xl:text-xl" : i >= 8 ? "text-[#3b82f6] font-extrabold text-lg xl:text-xl" : "text-[#1e293b] font-extrabold text-lg xl:text-xl"}>{i + 1}</span>
                </div>
                
                {/* Rep Name */}
                <div className="col-span-5 flex items-center justify-start ml-6 gap-3 xl:gap-4">
                  <div className={`w-6 h-6 xl:w-8 xl:h-8 rounded-full flex items-center justify-center text-[10px] xl:text-xs font-bold shrink-0 ${i >= 8 ? 'bg-[#dbeafe] text-[#3b82f6]' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                    {agent?.name ? agent.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase() : "-"}
                  </div>
                  <span className="text-[#0f172a] font-extrabold text-xs xl:text-base">{agent?.name || "-"}</span>
                </div>
                
                {/* Today */}
                <div className="col-span-2 flex items-center justify-center">
                   <div className="border-2 border-[#bfdbfe] text-[#2563eb] rounded-lg px-3 xl:px-5 py-0.5 xl:py-1 text-center min-w-[3rem] xl:min-w-[4rem] font-bold text-xs xl:text-sm">
                     {agent?.sales?.daily ?? "-"}
                   </div>
                </div>
                
                {/* Weekly */}
                <div className="col-span-2 flex items-center justify-center">
                   <div className="border-2 border-[#e2e8f0] text-[#64748b] rounded-lg px-3 xl:px-5 py-0.5 xl:py-1 text-center min-w-[3.5rem] xl:min-w-[4.5rem] font-bold text-xs xl:text-sm">
                     {agent?.sales?.weekly ?? "-"}
                   </div>
                </div>
                
                {/* Monthly */}
                <div className="col-span-2 flex items-center justify-center">
                   <div className="border-2 border-[#e2e8f0] text-[#64748b] rounded-lg px-3 xl:px-5 py-0.5 xl:py-1 text-center min-w-[3.5rem] xl:min-w-[4.5rem] font-bold text-xs xl:text-sm">
                     {agent?.sales?.monthly ?? "-"}
                   </div>
                </div>
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
