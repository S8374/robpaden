interface RecentSalesProps {
  isLoading?: boolean;
}

export function RecentSales({ isLoading }: RecentSalesProps) {
  const sales = [
    { id: 1, name: "Jordan Lee", initials: "JL", time: "2:41 PM", status: "Confirmed" },
    { id: 2, name: "Sam Patel", initials: "SP", time: "2:38 PM", status: "Confirmed" },
    { id: 3, name: "Casey Kim", initials: "CK", time: "2:30 PM", status: "Reversed" },
    { id: 4, name: "Riley Chen", initials: "RC", time: "2:22 PM", status: "Confirmed" },
  ];

  return (
    <div className="space-y-3">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-200 shadow-sm animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-200"></div>
              <div className="space-y-2">
                <div className="w-24 h-3 bg-zinc-200 rounded"></div>
                <div className="w-16 h-2 bg-zinc-200 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-4 bg-zinc-200 rounded"></div>
              <div className="w-16 h-6 bg-zinc-200 rounded-full"></div>
            </div>
          </div>
        ))
      ) : sales.map((sale) => (
        <div key={sale.id} className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#eef0ff] text-[#5252ff] flex items-center justify-center font-bold text-xs shrink-0">
              {sale.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">{sale.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{sale.time}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 justify-between sm:justify-end w-full sm:w-auto mt-1 sm:mt-0 pt-2 sm:pt-0 border-t border-zinc-100 sm:border-0">
            <span className="text-[13px] font-semibold text-zinc-800 whitespace-nowrap">1 sale</span>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
              sale.status === 'Confirmed' 
                ? 'bg-[#e5fcf1] text-[#1f9d55]' 
                : 'bg-[#ffedee] text-[#d93036]'
            }`}>
              {sale.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
