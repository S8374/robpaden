"use client";

const MOCK_AGENTS = [
  { name: "Jordan Lee", daily: 24, weekly: 128, monthly: 486, bell: true },
  { name: "Sam Patel", daily: 22, weekly: 118, monthly: 452, bell: false },
  { name: "Casey Kim", daily: 19, weekly: 101, monthly: 398, bell: true },
  { name: "Riley Chen", daily: 16, weekly: 90, monthly: 340, bell: false },
  { name: "Morgan Diaz", daily: 14, weekly: 78, monthly: 301, bell: false },
  { name: "Avery Brooks", daily: 11, weekly: 60, monthly: 245, bell: true },
  { name: "Taylor Reed", daily: 8, weekly: 45, monthly: 190, bell: false },
  { name: "Jamie Ortiz", daily: 5, weekly: 28, monthly: 140, bell: false },
  { name: "Drew Nakamura", daily: 3, weekly: 15, monthly: 95, bell: false },
  { name: "Casey Fuentes", daily: 2, weekly: 9, monthly: 60, bell: false },
];

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function TVBoardPage() {
  const activeAgents = MOCK_AGENTS;
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Extremely premium, glowing scanner sweep (no physical movement, just intense light)
    gsap.to('.gsap-row', {
      keyframes: {
        '0%': { 
          backgroundColor: 'transparent', 
          boxShadow: 'inset 0px 0 0 #3b82f6, 0 0 0px rgba(0,0,0,0)'
        },
        '50%': { 
          backgroundColor: 'rgba(37, 99, 235, 0.06)', 
          boxShadow: 'inset 4px 0 0 #3b82f6, 0 4px 15px rgba(0, 0, 0, 0.05)'
        },
        '100%': { 
          backgroundColor: 'transparent', 
          boxShadow: 'inset 0px 0 0 #3b82f6, 0 0 0px rgba(0,0,0,0)'
        }
      },
      duration: 1.5,
      ease: 'sine.inOut',
      stagger: {
        each: 0.25,
        from: "random",
        repeat: -1
      }
    });
  }, { scope: containerRef });

  useEffect(() => {
    const updateScale = () => {
      const targetRatio = 16 / 9;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const currentRatio = w / h;
      setScale(currentRatio > targetRatio ? h / 1080 : w / 1920);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#080d16] flex items-center justify-center overflow-hidden">
      <div 
        ref={containerRef}
        style={{ width: '1920px', height: '1080px', transform: `scale(${scale})`, transformOrigin: 'center center' }} 
        className="bg-[#080d16] text-white font-sans flex flex-col p-6 bg-[length:100%_100%] bg-no-repeat relative shrink-0"
      >
      {/* Background Overlay */}
      <div className="absolute left-0 top-0 w-96 h-96 bg-[#162740] rounded-full blur-[100px] opacity-60 z-0"></div>

      {/* Header */}
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

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-12 gap-4 xl:gap-6 pb-2 min-h-0 z-10 relative">
        
        {/* Left Col - Top 10 Leaderboard */}
        <div className="col-span-12 xl:col-span-7 border border-[#2d435d] rounded-[1.5rem] p-4 bg-[#141d2e] flex flex-col h-full overflow-hidden animate-panel-glow animate-shimmer">
          <h2 className="text-xl xl:text-2xl font-black text-center mb-6 tracking-widest text-white flex justify-center items-center uppercase">
            <img src="/images/icon/electric_icon.png" alt="Electric" className="w-6 h-6 xl:w-10 xl:h-10 object-contain mr-4" />
            TOP 10 LEADERBOARD
            <img src="/images/icon/electric_icon.png" alt="Electric" className="w-6 h-6 xl:w-10 xl:h-10 object-contain ml-4 transform scale-x-[-1]" />
          </h2>
          
          <div className="flex flex-col flex-1 bg-white rounded-2xl overflow-hidden shadow-inner">
            
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-white text-[#2563eb] font-extrabold py-4 px-4 text-xs xl:text-sm uppercase text-center shrink-0 border-b-2 border-gray-100">
              <div className="col-span-1 flex items-center justify-center">#</div>
              <div className="col-span-5 flex items-center justify-start ml-6">REP NAME</div>
              <div className="col-span-2 flex items-center justify-center">TODAY</div>
              <div className="col-span-2 flex items-center justify-center">WEEKLY</div>
              <div className="col-span-2 flex items-center justify-center">MONTHLY</div>
            </div>
            
            {/* Table Body */}
            <div className="flex flex-col flex-1 bg-white py-2">
              {Array.from({ length: 10 }).map((_, i) => {
                const agent = activeAgents[i];
                return (
                  <div key={i} className={`gsap-row grid grid-cols-12 items-center text-center text-xs xl:text-base font-bold flex-1 px-4 ${i !== 9 ? 'border-b border-gray-100' : ''}`}>
                    
                    {/* Number */}
                    <div className="col-span-1 flex items-center justify-center">
                      <span className={i < 3 ? "text-[#eab308] font-black text-lg xl:text-xl" : i >= 8 ? "text-[#3b82f6] font-extrabold text-lg xl:text-xl" : "text-[#1e293b] font-extrabold text-lg xl:text-xl"}>{i + 1}</span>
                    </div>
                    
                    {/* Rep Name */}
                    <div className="col-span-5 flex items-center justify-start ml-6 gap-3 xl:gap-4">
                      <div className={`w-6 h-6 xl:w-8 xl:h-8 rounded-full flex items-center justify-center text-[10px] xl:text-xs font-bold shrink-0 ${i >= 8 ? 'bg-[#dbeafe] text-[#3b82f6]' : 'bg-[#f1f5f9] text-[#64748b]'}`}>AB</div>
                      <span className="text-[#0f172a] font-extrabold text-xs xl:text-base">{agent?.name || ""}</span>
                    </div>
                    
                    {/* Today */}
                    <div className="col-span-2 flex items-center justify-center">
                       <div className="border-2 border-[#bfdbfe] text-[#2563eb] rounded-lg px-3 xl:px-5 py-0.5 xl:py-1 text-center min-w-[3rem] xl:min-w-[4rem] font-bold text-xs xl:text-sm">
                         {agent?.daily ?? ""}
                       </div>
                    </div>
                    
                    {/* Weekly */}
                    <div className="col-span-2 flex items-center justify-center">
                       <div className="border-2 border-[#e2e8f0] text-[#64748b] rounded-lg px-3 xl:px-5 py-0.5 xl:py-1 text-center min-w-[3.5rem] xl:min-w-[4.5rem] font-bold text-xs xl:text-sm">
                         {agent?.weekly ?? ""}
                       </div>
                    </div>
                    
                    {/* Monthly */}
                    <div className="col-span-2 flex items-center justify-center">
                       <div className="border-2 border-[#e2e8f0] text-[#64748b] rounded-lg px-3 xl:px-5 py-0.5 xl:py-1 text-center min-w-[3.5rem] xl:min-w-[4.5rem] font-bold text-xs xl:text-sm">
                         {agent?.monthly ?? ""}
                       </div>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="col-span-12 xl:col-span-5 flex flex-col justify-between gap-4 xl:gap-6 h-full overflow-hidden">
          
          {/* Team Goal */}
          <div className="border border-[#1e293b] rounded-2xl px-4 py-2 xl:px-6 xl:py-4 bg-[#080d16] flex-1 relative overflow-hidden flex flex-col justify-evenly animate-panel-glow animate-shimmer-delayed">
            <h2 className="text-base xl:text-xl font-black text-center text-white tracking-widest relative z-10 uppercase">
              TEAM GOAL
            </h2>
            
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-[#eab308] font-bold text-[10px] xl:text-sm tracking-wider">MONTHLY GOAL</span>
                  <div className="bg-white text-black font-extrabold px-3 py-1 rounded-md text-xs xl:text-base">3,200</div>
                </div>
                <span className="text-[#eab308] font-bold text-[10px] xl:text-sm tracking-wider">GOAL PROGRESS</span>
              </div>
              
              <div className="w-full h-6 xl:h-8 bg-[#1e293b] rounded-full border border-slate-700 overflow-hidden shadow-inner relative">
                <div className="h-full rounded-full animate-energy-flow shadow-[0_0_15px_rgba(0,229,255,0.6)]" style={{ width: '65%' }}></div>
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

          {/* Daily Recognition */}
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
                  <span className="text-black text-xs xl:text-sm font-extrabold truncate">Mike Johnson</span>
                </div>
              </div>
              
              {/* Most Sales */}
              <div className="flex flex-col items-center relative">
                <span className="text-[#38bdf8] mb-2 text-xs xl:text-sm uppercase font-bold tracking-wider relative z-20">MOST SALE</span>
                <div className="w-full h-14 xl:h-16 bg-white rounded-xl flex items-center relative pl-12 shadow-sm border border-transparent">
                  <img src="/images/icon/2nd_place.png" alt="Most" className="absolute left-[-20px] top-[-10px] w-16 h-16 xl:w-20 xl:h-20 object-contain drop-shadow-md z-30" />
                  <span className="text-black text-xs xl:text-sm font-extrabold truncate">John Doe</span>
                </div>
              </div>

              {/* Closest to Goal */}
              <div className="flex flex-col items-center relative">
                <span className="text-[#c084fc] mb-2 text-xs xl:text-sm uppercase font-bold tracking-wider relative z-20">CLOSET TO GOAL</span>
                <div className="w-full h-14 xl:h-16 bg-white rounded-xl flex items-center relative pl-12 shadow-sm border border-transparent">
                  <img src="/images/icon/goal.png" alt="Goal" className="absolute left-[-20px] top-[-10px] w-16 h-16 xl:w-20 xl:h-20 object-contain drop-shadow-md z-30" />
                  <span className="text-black text-xs xl:text-sm font-extrabold truncate">Jane Smith</span>
                </div>
              </div>
              
            </div>
          </div>

          {/* Bell Ringer */}
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
                Jordan<br/>Lee!
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Metrics */}
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
      </div>
    </div>
  );
}
