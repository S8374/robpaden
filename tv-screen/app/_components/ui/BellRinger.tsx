interface BellRingerProps {
  firstName: string;
  lastName: string;
}

export function BellRinger({ firstName, lastName }: BellRingerProps) {
  return (
    <div className="border border-[#1e293b] rounded-2xl p-4 xl:p-6 bg-[#080d16] flex items-center justify-between shrink-0 h-[100px] xl:h-[130px] animate-panel-glow animate-shimmer-delayed">
      <div className="flex items-center gap-4 xl:gap-8">
        {/* Bell Icon */}
        <div className="w-20 h-20 xl:w-24 xl:h-24 shrink-0 flex items-center justify-center relative -ml-2">
          <img src="/images/icon/bell.png" alt="Bell" className="w-16 h-16 xl:w-28 xl:h-28 object-contain drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] z-10 animate-bell-ring" />
        </div>
        
        {/* Text */}
        <div className="flex flex-col justify-center">
          <h2 className="font-master text-3xl xl:text-5xl italic text-[#facc15] tracking-wide whitespace-nowrap mb-1">BELL RINGER</h2>
          <span className="font-master text-sm xl:text-lg italic tracking-widest text-white whitespace-nowrap">RING IT LOUD. OWN THE DAY!</span>
        </div>
      </div>
      
      {/* Starburst Name */}
      <div className="relative w-24 h-24 xl:w-28 xl:h-28 shrink-0 flex items-center justify-center mr-2 drop-shadow-lg">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#facc15] z-0">
          <polygon fill="#facc15" points="50,0 58,22 85,8 72,32 100,30 80,50 100,70 72,68 85,92 58,78 50,100 42,78 15,92 28,68 0,70 20,50 0,30 28,32 15,8 42,22" />
        </svg>
        <div className="relative z-10 text-black font-black text-xs xl:text-sm text-center leading-tight mt-1">
          {firstName}<br/>{lastName}
        </div>
      </div>
    </div>
  );
}
