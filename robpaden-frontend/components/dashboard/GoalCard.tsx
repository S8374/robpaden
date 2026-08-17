interface GoalCardProps {
  title: string;
  percentage: number;
  fraction: string;
  isLoading?: boolean;
}

export function GoalCard({ title, percentage, fraction, isLoading }: GoalCardProps) {
  if (isLoading) {
    return (
      <div className="h-28 bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
        <div className="relative w-16 h-16 shrink-0 rounded-full bg-zinc-200 animate-pulse border-[12px] border-zinc-100"></div>
        <div className="flex flex-col gap-2 w-full">
          <div className="w-24 h-4 bg-zinc-200 rounded animate-pulse"></div>
          <div className="flex items-baseline gap-2">
            <div className="w-16 h-8 bg-zinc-200 rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-zinc-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  // SVG Circle Math
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="h-28 bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex items-center gap-6 group">
       <div className="relative w-16 h-16 shrink-0 group-hover:scale-105 transition-transform duration-300">
          <svg className="w-full h-full transform -rotate-90 rounded-full bg-[#eef0ff]" viewBox="0 0 64 64">
            {/* Progress Circle (Solid Pie Slice effect) */}
            <circle 
              cx="32" cy="32" r="16" 
              className="stroke-[#5252ff] transition-all duration-1000 ease-out" 
              strokeWidth="32" 
              fill="transparent" 
              strokeDasharray={100.53} // 2 * PI * 16
              strokeDashoffset={100.53 - (percentage / 100) * 100.53}
              strokeLinecap="butt"
            />
          </svg>
       </div>
       
       <div className="flex flex-col justify-center">
         <h3 className="text-sm font-semibold text-zinc-600 mb-1">{title}</h3>
         <div className="flex items-baseline gap-2">
           <span className="text-2xl font-bold text-zinc-900">{percentage}%</span>
           <span className="text-xs text-zinc-400 font-medium">{fraction}</span>
         </div>
       </div>
    </div>
  );
}
