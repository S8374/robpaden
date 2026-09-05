interface SalesCardProps {
  title: string;
  value: string;
  subtitle: string;
  bars: { height: number; active?: boolean; label?: string; sales?: number }[];
  isLoading?: boolean;
  startTime?: string;
  endTime?: string;
}

export function SalesCard({ title, value, subtitle, bars, isLoading, startTime, endTime }: SalesCardProps) {
  if (isLoading) {
    return (
      <div className="h-48 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
        <div>
          <div className="w-32 h-4 bg-zinc-200 rounded animate-pulse mb-3"></div>
          <div className="w-20 h-10 bg-zinc-200 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col mt-auto gap-2">
          <div className="flex items-end gap-3 h-12 w-full animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
              <div key={i} className="flex-1 rounded-full bg-zinc-200 h-full opacity-50"></div>
            ))}
          </div>
          <div className="flex justify-between w-full">
             <div className="w-8 h-3 bg-zinc-200 rounded animate-pulse"></div>
             <div className="w-8 h-3 bg-zinc-200 rounded animate-pulse"></div>
          </div>
          <div className="w-3/4 h-3 bg-zinc-200 rounded animate-pulse mt-1"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-48 bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 flex flex-col justify-between group relative">
      <div>
        <h3 className="text-sm font-semibold text-zinc-600">{title}</h3>
        <p className="text-4xl font-bold text-zinc-900 mt-2 font-master">{value}</p>
      </div>
      
      <div className="flex flex-col mt-auto gap-2">
        <div className="flex items-end gap-3 h-12 w-full">
          {bars.map((bar, i) => (
            <div 
              key={i} 
              className="flex-1 h-full flex items-end relative group/bar"
            >
              <div
                className={`w-full rounded-full transition-colors ${bar.active ? 'bg-[#5252ff]' : 'bg-[#eef0ff]'}`}
                style={{ height: `${bar.height}%`, minHeight: '4px' }}
              ></div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bar:flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-zinc-800 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap">
                  <span className="font-bold">{bar.sales}</span> sales at {bar.label}
                </div>
                <div className="w-2 h-2 bg-zinc-800 rotate-45 -mt-1"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-zinc-400 font-medium px-1">
          <span>{startTime || "9 AM"}</span>
          <span>{endTime || "3 PM"}</span>
        </div>
        <div className="text-[10px] text-zinc-400 mt-1">{subtitle}</div>
      </div>
    </div>
  );
}
