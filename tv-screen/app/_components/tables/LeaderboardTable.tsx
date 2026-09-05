"use client";

import { useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

interface LeaderboardTableProps {
  activeAgents: any[];
}

export function LeaderboardTable({ activeAgents }: LeaderboardTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutAgents, setLayoutAgents] = useState(activeAgents);
  const prevAgentsRef = useRef(activeAgents);

  useLayoutEffect(() => {
    if (JSON.stringify(prevAgentsRef.current) !== JSON.stringify(activeAgents)) {
      if (!containerRef.current) return;
      
      const q = gsap.utils.selector(containerRef);
      const state = Flip.getState(q(".agent-row"));
      
      setLayoutAgents(activeAgents);
      prevAgentsRef.current = activeAgents;
      
      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 2, // Longer duration for the dramatic shuffle
          ease: "back.inOut(2.5)", // Extreme overshoot: goes backwards, flies past target, then settles
          absolute: true,
          zIndex: 50,
          stagger: 0.05,
          onStart: (elements) => {
            // Make the moving rows pop out dynamically and SPIN (ghuira fira)
            gsap.to(elements, {
              scale: 1.1,
              rotationX: 360, // Full flip spin
              boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.5)",
              backgroundColor: "#ffffff",
              duration: 1.5,
              ease: "power2.inOut"
            });
          },
          onComplete: (elements) => {
            // Settle back to normal
            gsap.to(elements, {
              scale: 1,
              rotation: 0,
              boxShadow: "none",
              backgroundColor: "transparent",
              clearProps: "all",
              duration: 0.5
            });
          },
          onEnter: (elements) => gsap.fromTo(elements, {opacity: 0, y: 50, scale: 0.8}, {opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(2)"}),
          onLeave: (elements) => gsap.to(elements, {opacity: 0, y: -50, scale: 0.8, duration: 0.3})
        });
      });
    }
  }, [activeAgents]);

  useGSAP(() => {
    // Clean, professional sequential highlight effect
    gsap.to('.agent-row', {
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: {
        each: 0.15,
        from: 'start',
        repeat: -1,
        yoyo: true
      }
    });
    
    // Smooth moving sheen overlay across the table
    gsap.to('.sheen-overlay', {
      x: '200%',
      duration: 4,
      repeat: -1,
      ease: 'none',
      delay: 2
    });
  }, { scope: containerRef });

  return (
    <div className="col-span-12 xl:col-span-7 border border-[#2d435d] rounded-[1.5rem] p-4 bg-[#141d2e] flex flex-col h-full overflow-hidden animate-panel-glow animate-shimmer">
      <h2 className="text-xl xl:text-2xl font-black text-center mb-6 tracking-widest text-white flex justify-center items-center uppercase">
        <img src="/images/icon/electric_icon.png" alt="Electric" className="w-6 h-6 xl:w-10 xl:h-10 object-contain mr-4" />
        TOP 10 LEADERBOARD
        <img src="/images/icon/electric_icon.png" alt="Electric" className="w-6 h-6 xl:w-10 xl:h-10 object-contain ml-4 transform scale-x-[-1]" />
      </h2>
      
      <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-inner relative">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-white text-[#2563eb] font-extrabold py-4 px-4 text-xs xl:text-sm uppercase text-center shrink-0 border-b-2 border-gray-100 rounded-t-2xl z-20 relative">
          <div className="col-span-1 flex items-center justify-center">#</div>
          <div className="col-span-5 flex items-center justify-start ml-6">REP NAME</div>
          <div className="col-span-2 flex items-center justify-center">TODAY</div>
          <div className="col-span-2 flex items-center justify-center">WEEKLY</div>
          <div className="col-span-2 flex items-center justify-center">MONTHLY</div>
        </div>
        
        {/* Table Body */}
        <div className="flex flex-col flex-1 bg-white pb-2 relative rounded-b-2xl overflow-hidden" ref={containerRef}>
          
          {/* Moving sheen overlay */}
          <div className="sheen-overlay absolute top-0 bottom-0 left-[-100%] w-full bg-gradient-to-r from-transparent via-blue-400/10 to-transparent skew-x-12 pointer-events-none z-0"></div>

          {Array.from({ length: 10 }).map((_, i) => {
            const agent = layoutAgents[i];
            const key = agent?.id ? `agent-${agent.id}` : `empty-${i}`;
            
            return (
              <div 
                key={key} 
                data-flip-id={key} 
                className={`agent-row grid grid-cols-12 items-center text-center text-xs xl:text-base font-bold flex-1 px-4 z-10 ${i !== 9 ? 'border-b border-gray-100' : ''} ${i < 3 ? 'bg-gradient-to-r from-transparent via-blue-50/50 to-transparent' : ''}`}
              >
                
                {/* Number */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className={i < 3 ? "text-[#eab308] font-black text-lg xl:text-xl" : i >= 8 ? "text-[#3b82f6] font-extrabold text-lg xl:text-xl" : "text-[#1e293b] font-extrabold text-lg xl:text-xl"}>{i + 1}</span>
                </div>
                
                {/* Rep Name */}
                <div className="col-span-5 flex items-center justify-start ml-6 gap-3 xl:gap-4">
                  {agent?.avatarUrl ? (
                    <img src={agent.avatarUrl} alt={agent.name} className="w-6 h-6 xl:w-8 xl:h-8 rounded-full object-cover shrink-0 ring-2 ring-gray-100 shadow-sm" />
                  ) : (
                    <div className={`w-6 h-6 xl:w-8 xl:h-8 rounded-full flex items-center justify-center text-[10px] xl:text-xs font-bold shrink-0 ${i >= 8 ? 'bg-[#dbeafe] text-[#3b82f6]' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                      {agent?.name ? agent.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase() : "-"}
                    </div>
                  )}
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
  );
}
