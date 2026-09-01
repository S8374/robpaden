interface DailyRecognitionProps {
  dailyRecognition: {
    firstSale: string | null;
    mostSale: string | null;
    closestToGoal: string | null;
  };
}

export function DailyRecognition({ dailyRecognition }: DailyRecognitionProps) {
  return (
    <div className="border border-[#1e293b] rounded-2xl p-6 xl:p-8 bg-[#080d16] flex-1 relative overflow-hidden flex flex-col justify-around animate-panel-glow animate-shimmer">
      <h2 className="text-base xl:text-xl font-black text-center tracking-widest text-white flex justify-center items-center relative z-10">
        <span className="text-white mr-3">★</span>
        DAILY RECOGNITION
        <span className="text-white ml-3">★</span>
      </h2>
      
      <div className="grid grid-cols-3 gap-4 xl:gap-6 text-center font-bold relative z-10 mt-4">
        
        {/* First Sale */}
        <div className="flex flex-col items-center relative">
          <span className="text-[#4ade80] mb-2 text-xs xl:text-sm uppercase font-bold tracking-wider relative z-20">FIRST SALE</span>
          <div className="w-full h-14 xl:h-16 bg-white rounded-xl flex items-center relative pl-12 shadow-sm border border-transparent">
            <img src="/images/icon/first_place.png" alt="First" className="absolute left-[-20px] top-[-10px] w-16 h-16 xl:w-20 xl:h-20 object-contain drop-shadow-md z-30" />
            <span className="text-black text-xs xl:text-sm font-extrabold truncate">{dailyRecognition.firstSale || "-"}</span>
          </div>
        </div>
        
        {/* Most Sales */}
        <div className="flex flex-col items-center relative">
          <span className="text-[#38bdf8] mb-2 text-xs xl:text-sm uppercase font-bold tracking-wider relative z-20">MOST SALE</span>
          <div className="w-full h-14 xl:h-16 bg-white rounded-xl flex items-center relative pl-12 shadow-sm border border-transparent">
            <img src="/images/icon/2nd_place.png" alt="Most" className="absolute left-[-20px] top-[-10px] w-16 h-16 xl:w-20 xl:h-20 object-contain drop-shadow-md z-30" />
            <span className="text-black text-xs xl:text-sm font-extrabold truncate">{dailyRecognition.mostSale || "-"}</span>
          </div>
        </div>

        {/* Closest to Goal */}
        <div className="flex flex-col items-center relative">
          <span className="text-[#c084fc] mb-2 text-xs xl:text-sm uppercase font-bold tracking-wider relative z-20">CLOSET TO GOAL</span>
          <div className="w-full h-14 xl:h-16 bg-white rounded-xl flex items-center relative pl-12 shadow-sm border border-transparent">
            <img src="/images/icon/goal.png" alt="Goal" className="absolute left-[-20px] top-[-10px] w-16 h-16 xl:w-20 xl:h-20 object-contain drop-shadow-md z-30" />
            <span className="text-black text-xs xl:text-sm font-extrabold truncate">{dailyRecognition.closestToGoal || "-"}</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
