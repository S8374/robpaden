interface TeamGoalProgressProps {
  teamGoal: {
    monthlyGoal: number;
    progress: number;
  };
}

export function TeamGoalProgress({ teamGoal }: TeamGoalProgressProps) {
  return (
    <div className="border border-[#1e293b] rounded-2xl px-4 py-2 xl:px-6 xl:py-4 bg-[#080d16] flex-1 relative overflow-hidden flex flex-col justify-evenly animate-panel-glow animate-shimmer-delayed">
      <h2 className="text-base xl:text-xl font-black text-center text-white tracking-widest relative z-10 uppercase">
        TEAM GOAL
      </h2>
      
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-[#eab308] font-bold text-[10px] xl:text-sm tracking-wider">MONTHLY GOAL</span>
            <div className="bg-white text-black font-extrabold px-3 py-1 rounded-md text-xs xl:text-base">
              {teamGoal.monthlyGoal.toLocaleString()}
            </div>
          </div>
          <span className="text-[#eab308] font-bold text-[10px] xl:text-sm tracking-wider">GOAL PROGRESS</span>
        </div>
        
        <div className="w-full h-6 xl:h-8 bg-[#1e293b] rounded-full border border-slate-700 overflow-hidden shadow-inner relative">
          <div 
            className="h-full rounded-full animate-energy-flow shadow-[0_0_15px_rgba(0,229,255,0.6)]" 
            style={{ width: `${teamGoal.progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-[10px] xl:text-xs text-[#00e5ff] font-bold px-2 opacity-90">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
      
      <div className="text-center text-[#00e5ff] font-black text-sm xl:text-lg tracking-widest relative z-10">
        TOGETHER, WE WIN!
      </div>
    </div>
  );
}
