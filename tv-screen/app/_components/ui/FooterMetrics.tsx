export function FooterMetrics() {
  return (
    <footer className="w-full pt-4 z-10 relative">
      <div className="grid grid-cols-5 gap-3 xl:gap-6 mb-4 xl:mb-6">
        <div className="flex items-center justify-center gap-3 xl:gap-4 border-2 border-[#38bdf8]/80 rounded-2xl px-2 py-3 xl:py-4 bg-[#080d16] shadow-[0_0_15px_rgba(56,189,248,0.2)] animate-shimmer">
          <img src="/images/icon/call.png" className="w-8 h-8 xl:w-12 xl:h-12 object-contain" alt="Call" />
          <div className="flex flex-col text-[10px] xl:text-[11px] font-black tracking-widest leading-tight">
            <span className="text-white">MAKE THE CALL</span>
            <span className="text-[#38bdf8]">TAKE THE CHANCE</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 xl:gap-4 border-2 border-[#4ade80]/80 rounded-2xl px-2 py-3 xl:py-4 bg-[#080d16] shadow-[0_0_15px_rgba(74,222,128,0.2)] animate-shimmer-delayed">
          <img src="/images/icon/people.png" className="w-8 h-8 xl:w-12 xl:h-12 object-contain" alt="Relationships" />
          <div className="flex flex-col text-[10px] xl:text-[11px] font-black tracking-widest leading-tight">
            <span className="text-white">MAKE THE CALL</span>
            <span className="text-[#4ade80]">TAKE THE CHANCE</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 xl:gap-4 border-2 border-[#facc15]/80 rounded-2xl px-2 py-3 xl:py-4 bg-[#080d16] shadow-[0_0_15px_rgba(250,204,21,0.2)] animate-shimmer">
          <img src="/images/icon/electric.png" alt="Electric" className="w-8 h-8 xl:w-12 xl:h-12 object-contain" />
          <div className="flex flex-col text-[10px] xl:text-[11px] font-black tracking-widest leading-tight">
            <span className="text-white">MAKE THE CALL</span>
            <span className="text-[#facc15]">TAKE THE CHANCE</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 xl:gap-4 border-2 border-[#c084fc]/80 rounded-2xl px-2 py-3 xl:py-4 bg-[#080d16] shadow-[0_0_15px_rgba(192,132,252,0.2)] animate-shimmer-delayed">
          <img src="/images/icon/collaborations.png" className="w-8 h-8 xl:w-12 xl:h-12 object-contain" alt="Deals" />
          <div className="flex flex-col text-[10px] xl:text-[11px] font-black tracking-widest leading-tight">
            <span className="text-white">MAKE THE CALL</span>
            <span className="text-[#c084fc]">TAKE THE CHANCE</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 xl:gap-4 border-2 border-[#00e5ff]/80 rounded-2xl px-2 py-3 xl:py-4 bg-[#080d16] shadow-[0_0_15px_rgba(0,229,255,0.2)] animate-shimmer">
          <img src="/images/icon/increased.png" className="w-8 h-8 xl:w-12 xl:h-12 object-contain" alt="Energy" />
          <div className="flex flex-col text-[10px] xl:text-[11px] font-black tracking-widest leading-tight">
            <span className="text-white">MAKE THE CALL</span>
            <span className="text-[#00e5ff]">TAKE THE CHANCE</span>
          </div>
        </div>
      </div>
      
      <div className="text-center flex justify-center items-center gap-4 xl:gap-6 mt-1 xl:mt-2 animate-pulse">
        <img src="/images/icon/electric_icon.png" alt="Electric" className="w-6 h-6 xl:w-20 xl:h-20 object-contain transform scale-x-[-1]" />
        <h2 className="text-base xl:text-xl font-master italic tracking-widest text-white whitespace-nowrap px-2">
          POSITIVE ATTITUDE. GREAT ENERGY. MASSIVE ACTION. WIN TOGETHER!
        </h2>
        <img src="/images/icon/electric_icon.png" alt="Electric" className="w-6 h-6 xl:w-20 xl:h-20 object-contain" />
      </div>
    </footer>
  );
}
