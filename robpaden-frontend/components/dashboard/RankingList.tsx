interface RankingListProps {
  isLoading?: boolean;
}

export function RankingList({ isLoading }: RankingListProps) {
  const rankings = [
    { rank: 1, name: "Jordan Lee", initials: "JL", score: 24, percent: 100 },
    { rank: 2, name: "Sam Patel", initials: "SP", score: 22, percent: 90 },
    { rank: 3, name: "Casey Kim", initials: "CK", score: 19, percent: 75 },
  ];

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
      ) : rankings.map((item) => (
        <div key={item.rank} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow group">
          <span className="text-sm font-bold text-zinc-500 w-4 text-center">{item.rank}</span>
          <div className="w-10 h-10 rounded-full bg-[#eef0ff] text-[#5252ff] flex items-center justify-center font-bold text-xs shrink-0">
            {item.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-zinc-900 truncate">{item.name}</span>
              <span className="text-sm font-bold text-zinc-900">{item.score}</span>
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
