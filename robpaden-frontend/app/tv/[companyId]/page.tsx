"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useParams } from "next/navigation";
import { useGetTVBoardQuery } from "@/redux/api/tv.api";

const CelebrationOverlay = ({ 
  isActive, 
  agentName,
  soundUrl
}: { 
  isActive: boolean; 
  agentName: string;
  soundUrl: string | null;
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const boomRef = useRef<HTMLDivElement>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(soundUrl || "/sounds/bell_ring.mp3");
      audioRef.current = audio;
      audio.volume = 1.0;
      audio.play().catch(e => {
        console.error("Audio autoplay prevented by browser. The TV browser needs to be configured to allow autoplay without interaction.", e);
      });
    } catch(e) {
      console.error("Failed to play audio", e);
    }
  };

  useEffect(() => {
    let fadeTimeoutId: NodeJS.Timeout;
    let audioTimeoutId: NodeJS.Timeout;

    if (isActive) {
      playAudio();

      // Kill any ongoing tweens on these elements to ensure clean replay
      gsap.killTweensOf([
        overlayRef.current, flashRef.current, containerRef.current, 
        avatarRef.current, nameRef.current, subtitleRef.current, boomRef.current
      ]);

      const tl = gsap.timeline();

      // 1. Overlay fade in
      tl.fromTo(overlayRef.current, 
        { opacity: 0, display: "none" },
        { opacity: 1, display: "flex", duration: 0.2 }
      );

      // 2. Avatar drops in with spin and bounce
      tl.fromTo(avatarRef.current,
        { y: -200, scale: 0, opacity: 0, rotation: -180 },
        { y: 0, scale: 1, opacity: 1, rotation: 0, duration: 0.7, ease: "bounce.out" }
      );

      // 3. Name flies in from left
      tl.fromTo(nameRef.current,
        { x: -150, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.5)" },
        "-=0.4"
      );

      // 4. "Just made a sale" flies in from right
      tl.fromTo(subtitleRef.current,
        { x: 150, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.5)" },
        "-=0.3"
      );

      // 5. White screen flash for impact
      tl.fromTo(flashRef.current, 
        { opacity: 1, display: "block" },
        { opacity: 0, display: "none", duration: 0.6, ease: "power2.out" },
        "-=0.1"
      );

      // 6. BOOM! explodes from center
      tl.fromTo(boomRef.current,
        { scale: 0, opacity: 0, rotation: -45 },
        { scale: 1.3, opacity: 1, rotation: 5, duration: 0.5, ease: "back.out(2)" },
        "<" // play at the same time as the flash
      );
      
      // 7. BOOM settles to normal size
      tl.to(boomRef.current, { scale: 1, rotation: -2, duration: 0.3, ease: "power2.inOut" });

      // 8. Continuous energetic pulse on BOOM
      gsap.to(boomRef.current, {
        scale: 1.08,
        rotation: 2,
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.2 // starts pulsing after initial animation completes
      });

      // Hide visuals after 10 seconds with a smooth 1.5s fade
      fadeTimeoutId = setTimeout(() => {
        gsap.to(overlayRef.current, { opacity: 0, duration: 1.5, onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = "none";
        }});
      }, 10000);
      
      // Stop audio exactly when the visuals finish fading (10s + 1.5s = 11.5 seconds)
      audioTimeoutId = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }, 11500);
    }

    return () => {
      if (fadeTimeoutId) clearTimeout(fadeTimeoutId);
      if (audioTimeoutId) clearTimeout(audioTimeoutId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [isActive]);

  return (
    <>

      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md hidden flex-col items-center justify-center overflow-hidden"
      >
        {/* Flash overlay for impact */}
        <div ref={flashRef} className="absolute inset-0 bg-white z-0 hidden pointer-events-none mix-blend-overlay"></div>

        {/* Confetti particles (CSS based basic) */}
        <div className="absolute inset-0 pointer-events-none opacity-60 bg-[url('/images/icon/confetti_bg.png')] bg-cover bg-center animate-pulse"></div>

        {/* Floating/rotating background rays */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 z-0">
           <div className="w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(250,204,21,0.5)_10deg,transparent_20deg,rgba(250,204,21,0.5)_30deg,transparent_40deg,rgba(250,204,21,0.5)_50deg,transparent_60deg,rgba(250,204,21,0.5)_70deg,transparent_80deg,rgba(250,204,21,0.5)_90deg,transparent_100deg,rgba(250,204,21,0.5)_110deg,transparent_120deg,rgba(250,204,21,0.5)_130deg,transparent_140deg,rgba(250,204,21,0.5)_150deg,transparent_160deg,rgba(250,204,21,0.5)_170deg,transparent_180deg,rgba(250,204,21,0.5)_190deg,transparent_200deg,rgba(250,204,21,0.5)_210deg,transparent_220deg,rgba(250,204,21,0.5)_230deg,transparent_240deg,rgba(250,204,21,0.5)_250deg,transparent_260deg,rgba(250,204,21,0.5)_270deg,transparent_280deg,rgba(250,204,21,0.5)_290deg,transparent_300deg,rgba(250,204,21,0.5)_310deg,transparent_320deg,rgba(250,204,21,0.5)_330deg,transparent_340deg,rgba(250,204,21,0.5)_350deg,transparent_360deg)] rounded-full animate-spin-slow"></div>
        </div>

        <div ref={containerRef} className="flex flex-col items-center justify-center relative z-10 text-center w-full px-8">
          <div ref={avatarRef} className="w-32 h-32 xl:w-48 xl:h-48 rounded-full bg-white text-[#3b82f6] flex items-center justify-center text-4xl xl:text-6xl font-black mb-8 shadow-[0_0_80px_rgba(59,130,246,0.8)] border-4 border-yellow-400 shrink-0">
            {agentName ? agentName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : "AB"}
          </div>
          
          <h1 ref={nameRef} className="text-white text-5xl xl:text-7xl font-extrabold mb-6 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] max-w-full overflow-hidden text-ellipsis px-4 break-words line-clamp-2 uppercase tracking-wide">
            {agentName}
          </h1>
          <p ref={subtitleRef} className="text-2xl xl:text-4xl text-yellow-300 font-bold mb-16 tracking-widest drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)] uppercase">
            Just Made a Sale!
          </p>
          
          <div ref={boomRef} className="font-master italic text-[#facc15] text-8xl xl:text-[160px] leading-none tracking-tighter drop-shadow-[0_15px_60px_rgba(250,204,21,0.8)] [text-shadow:-4px_-4px_0_#d97706,4px_-4px_0_#d97706,-4px_4px_0_#d97706,4px_4px_0_#d97706]">
            BOOM!
          </div>
        </div>
      </div>
    </>
  );
};

export default function TVBoardPage() {
  const params = useParams();
  const companyId = Number(params?.companyId) || 1;

  // Poll the API every 10 seconds for live data
  const { data: response, isLoading } = useGetTVBoardQuery(companyId, {
    pollingInterval: 10000,
  });

  const boardData = response?.data;
  const activeAgents = boardData?.leaderboards.agents.daily || [];

  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Audio Unlock State (Silent background)
  useEffect(() => {
    const handleGlobalClick = () => {
      const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
      silentAudio.volume = 0.01;
      silentAudio.play().catch(() => {});
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleGlobalClick);
    };
    
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleGlobalClick);
    
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleGlobalClick);
    };
  }, []);
  
  // Celebration State
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [celebratingAgent, setCelebratingAgent] = useState("");
  const prevSaleIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (boardData?.bellRinger) {
      const currentSaleId = boardData.bellRinger.id;
      // Only trigger if we already have a previous sale ID (so we don't trigger on initial load),
      // AND the new sale ID is different from the previous one.
      if (prevSaleIdRef.current !== null && prevSaleIdRef.current !== currentSaleId) {
        // Force reset the active state first so the child component's useEffect re-runs completely
        setCelebrationActive(false);
        
        // Use a tiny timeout to allow the state to clear before setting it back to true
        setTimeout(() => {
          setCelebratingAgent(boardData.bellRinger!.name);
          setCelebrationActive(true);
        }, 50);
      }
      prevSaleIdRef.current = currentSaleId;
    }
  }, [boardData?.bellRinger?.id]);

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

  if (isLoading && !boardData) {
    return (
      <div className="w-screen h-screen bg-[#080d16] flex items-center justify-center text-white">
        Loading TV Board...
      </div>
    );
  }

  const teamGoal = boardData?.teamGoal || { monthlyGoal: 1000, progress: 0 };
  const dailyRecognition = boardData?.dailyRecognition || { firstSale: "-", mostSale: "-", closestToGoal: "-" };
  const bellRingerName = boardData?.bellRinger?.name || "No Sales Yet";
  const bellRingerFirstName = bellRingerName.split(" ")[0];
  const bellRingerLastName = bellRingerName.split(" ")[1] || "";

  return (
    <div className="w-screen h-screen bg-[#080d16] flex items-center justify-center overflow-hidden">
      
      {/* Dynamic Overlay Celebration */}
      <CelebrationOverlay 
        isActive={celebrationActive} 
        agentName={celebratingAgent} 
        soundUrl={boardData?.company?.celebrationSoundUrl || null} 
      />

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
                      <div className={`w-6 h-6 xl:w-8 xl:h-8 rounded-full flex items-center justify-center text-[10px] xl:text-xs font-bold shrink-0 ${i >= 8 ? 'bg-[#dbeafe] text-[#3b82f6]' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                        {agent?.name ? agent.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : "-"}
                      </div>
                      <span className="text-[#0f172a] font-extrabold text-xs xl:text-base">{agent?.name || "-"}</span>
                    </div>
                    
                    {/* Today */}
                    <div className="col-span-2 flex items-center justify-center">
                       <div className="border-2 border-[#bfdbfe] text-[#2563eb] rounded-lg px-3 xl:px-5 py-0.5 xl:py-1 text-center min-w-[3rem] xl:min-w-[4rem] font-bold text-xs xl:text-sm">
                         {agent?.sales?.daily ?? "-"}
                       </div>
                    </div>
                    
                    {/* Weekly */}
                    <div className="col-span-2 flex items-center justify-center">
                       <div className="border-2 border-[#e2e8f0] text-[#64748b] rounded-lg px-3 xl:px-5 py-0.5 xl:py-1 text-center min-w-[3.5rem] xl:min-w-[4.5rem] font-bold text-xs xl:text-sm">
                         {agent?.sales?.weekly ?? "-"}
                       </div>
                    </div>
                    
                    {/* Monthly */}
                    <div className="col-span-2 flex items-center justify-center">
                       <div className="border-2 border-[#e2e8f0] text-[#64748b] rounded-lg px-3 xl:px-5 py-0.5 xl:py-1 text-center min-w-[3.5rem] xl:min-w-[4.5rem] font-bold text-xs xl:text-sm">
                         {agent?.sales?.monthly ?? "-"}
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
                  <div className="bg-white text-black font-extrabold px-3 py-1 rounded-md text-xs xl:text-base">{teamGoal.monthlyGoal.toLocaleString()}</div>
                </div>
                <span className="text-[#eab308] font-bold text-[10px] xl:text-sm tracking-wider">GOAL PROGRESS</span>
              </div>
              
              <div className="w-full h-6 xl:h-8 bg-[#1e293b] rounded-full border border-slate-700 overflow-hidden shadow-inner relative">
                <div className="h-full rounded-full animate-energy-flow shadow-[0_0_15px_rgba(0,229,255,0.6)]" style={{ width: `${teamGoal.progress}%` }}></div>
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
                {bellRingerFirstName}<br/>{bellRingerLastName}
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
