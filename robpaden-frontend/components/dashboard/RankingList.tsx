interface RankingListProps {
  isLoading?: boolean;
  data?: any[];
}

export function RankingList({ isLoading, data }: RankingListProps) {
  const rankings = (data || []).map((r: any) => ({
    ...r,
    percent: Math.min((r.sales / (r.dailyGoal || 1)) * 100, 100)
  }));

  return (
    <div className="space-y-3">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-zinc-200 shadow-sm animate-pulse">
            <div className="w-4 h-4 bg-zinc-200 rounded"></div>
            <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0"></div>
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex justify-between">
                 <div className="w-24 h-4 bg-zinc-200 rounded"></div>
                 <div className="w-8 h-4 bg-zinc-200 rounded"></div>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 rounded-full"></div>
            </div>
          </div>
        ))
      ) : rankings.length === 0 ? (
        <div className="p-8 text-center text-zinc-500 bg-white rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-sm font-medium">Not available</p>
        </div>
      ) : rankings.map((item) => (
        <div key={item.rank} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow group">
          <span className="text-sm font-bold text-zinc-500 w-4 text-center">{item.rank}</span>
          <div className="w-10 h-10 rounded-full bg-[#eef0ff] text-[#5252ff] flex items-center justify-center font-bold text-xs shrink-0">
            {item.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-zinc-900 truncate">{item.name}</span>
              <span className="text-sm font-bold text-zinc-900">{item.sales} <span className="text-zinc-400 text-xs font-medium">/ {item.dailyGoal || 1}</span></span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5252ff] rounded-full" 
                style={{ width: `${item.percent}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
