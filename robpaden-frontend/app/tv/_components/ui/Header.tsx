export function Header() {
  return (
    <header className="flex justify-between items-center mb-6 xl:mb-8 z-10 relative">
      <div className="flex items-center">
        <img src="/images/tvsidelogo.png" alt="American Energy Advisors" className="h-16 xl:h-30 w-auto object-contain" />
      </div>
      
      <div className="flex-1 flex justify-center items-center mt-1 xl:mt-2 relative">
        <div className="flex flex-col transform -skew-x-6 drop-shadow-lg items-center relative z-10 ">
          {/* Left Lightning */}
          <img 
            src="/images/icon/lightning_bg.png" 
            alt="Lightning" 
            className="absolute animate-thunder h-auto object-contain opacity-100 z-0 pointer-events-none mix-blend-screen" 
            style={{ left: '-55%', top: '-80%', transform: 'rotate(-25deg) skewX(6deg)' }}
          />
          
          {/* Right Lightning */}
          <img 
            src="/images/icon/lightning_bg.png" 
            alt="Lightning" 
            className="absolute animate-thunder-delayed h-auto object-contain opacity-100 z-0 pointer-events-none mix-blend-screen" 
            style={{ right: '-55%', top: '-70%', transform: 'rotate(25deg) skewX(6deg)' }}
          />

          <span className="font-master text-xl xl:text-3xl italic text-white self-start ml-4 xl:ml-8 tracking-wider whitespace-nowrap relative z-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] -translate-y-2 xl:-translate-y-4">LET'S</span>
          <span className="font-master text-5xl xl:text-7xl italic text-[#facc15] tracking-tighter whitespace-nowrap drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] leading-none -mt-2 -mb-2 xl:-mt-2 xl:-mb-4 relative z-10 animate-text-glow">POWER UP</span>
          <span className="font-master text-2xl xl:text-4xl italic text-white self-end mr-4 xl:mr-8 tracking-widest whitespace-nowrap relative z-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] translate-y-2 xl:translate-y-4">AND CLOSE!</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end text-right">
          <h2 className="text-lg xl:text-2xl font-black text-white tracking-wide">ENERGY TODAY</h2>
          <h2 className="text-lg xl:text-2xl font-black text-[#38bdf8] mb-3 tracking-wide">SUCCESS TOMORROW</h2>
          <div className="border border-white/50 px-6 py-1.5 text-sm xl:text-sm font-bold rounded-full tracking-widest bg-transparent">
            MAKE EVERY CALL COUNT!
          </div>
        </div>
        <img src="/images/icon/electric_icon.png" alt="Electric" className="w-12 h-12 xl:w-16 xl:h-16 object-contain -mt-8" />
      </div>
    </header>
  );
}
