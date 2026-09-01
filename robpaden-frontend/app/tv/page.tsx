"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useTVBoardData } from "./_hooks/useTVBoardData";

// Components
import { CelebrationOverlay } from "./_components/ui/CelebrationOverlay";
import { TVLoginScreen } from "./_components/auth/TVLoginScreen";
import { LeaderboardTable } from "./_components/tables/LeaderboardTable";
import { TeamGoalProgress } from "./_components/ui/TeamGoalProgress";
import { DailyRecognition } from "./_components/ui/DailyRecognition";
import { BellRinger } from "./_components/ui/BellRinger";
import { Header } from "./_components/ui/Header";
import { FooterMetrics } from "./_components/ui/FooterMetrics";

export default function TVBoardPage() {
  const {
    isInitializing,
    password,
    inputPassword,
    setInputPassword,
    handlePasswordSubmit,
    isLoggingIn,
    authError,
    blockedError,
    isLoading,
    error,
    boardData,
    scale,
    containerRef,
    celebrationActive,
    celebratingAgent
  } = useTVBoardData();

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

  const SkeletonLoader = () => (
    <div className="w-screen h-screen bg-[#030712] flex items-center justify-center overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-6 relative z-10">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    </div>
  );

  // 1. Initial hydration check (prevent hydration mismatch and flash)
  if (isInitializing) {
    return <SkeletonLoader />;
  }

  // 2. Authentication check
  if (!password) {
    return (
      <TVLoginScreen 
        inputPassword={inputPassword}
        setInputPassword={setInputPassword}
        handlePasswordSubmit={handlePasswordSubmit}
        isLoggingIn={isLoggingIn}
        authError={authError}
        blockedError={blockedError}
      />
    );
  }

  // 3. Strict Data Guarantee (Must have data and NO error)
  // Even if they have cached data, if there's an error (e.g. 403 blocked), do not render the board.
  if (!boardData || error) {
    return <SkeletonLoader />;
  }

  const teamGoal = boardData?.teamGoal || { monthlyGoal: 1000, progress: 0 };
  const dailyRecognition = boardData?.dailyRecognition || { firstSale: "-", mostSale: "-", closestToGoal: "-" };
  const activeAgents = boardData?.leaderboards.agents.daily || [];
  
  const bellRingerName = boardData?.bellRinger?.name || "No Sales Yet";
  const bellRingerFirstName = bellRingerName.split(" ")[0];
  const bellRingerLastName = bellRingerName.split(" ")[1] || "";

  const theme = boardData?.company?.tvTheme || "default";
  
  // Theme styling overrides
  const getThemeWrapperClass = () => {
    switch(theme) {
      case "cyberpunk": return "bg-[#0b001a]";
      case "midnight-gold": return "bg-[#0f0e0a]";
      case "ocean-deep": return "bg-[#00111f]";
      case "crimson-glow": return "bg-[#140003]";
      case "galactic-energy": return "bg-[#0a001a]";
      case "lava-strike": return "bg-[#0a0000]";
      case "neon-matrix": return "bg-[#001405]";
      default: return "bg-[#080d16]";
    }
  };

  const getThemeInnerClass = () => {
    switch(theme) {
      case "cyberpunk": return "bg-[#0b001a] text-[#00f3ff]";
      case "midnight-gold": return "bg-[#0f0e0a] text-white";
      case "ocean-deep": return "bg-[#00111f] text-white";
      case "crimson-glow": return "bg-[#140003] text-white";
      case "galactic-energy": return "bg-[#0a001a] text-white";
      case "lava-strike": return "bg-[#0a0000] text-white";
      case "neon-matrix": return "bg-[#001405] text-[#4ade80]";
      default: return "bg-[#080d16] text-white";
    }
  };

  const getThemeGlowClass = () => {
    switch(theme) {
      case "cyberpunk": return "bg-[#ff00ff] opacity-40";
      case "midnight-gold": return "bg-[#d97706] opacity-30";
      case "ocean-deep": return "bg-[#0284c7] opacity-40";
      case "crimson-glow": return "bg-[#e11d48] opacity-30";
      case "galactic-energy": return "bg-[#a855f7] opacity-40";
      case "lava-strike": return "bg-[#ea580c] opacity-40";
      case "neon-matrix": return "bg-[#22c55e] opacity-30";
      default: return "bg-[#162740] opacity-60";
    }
  };

  return (
    <div className={`w-screen h-screen ${getThemeWrapperClass()} flex items-center justify-center overflow-hidden transition-colors duration-1000`}>
      
      <CelebrationOverlay 
        isActive={celebrationActive} 
        agentName={celebratingAgent} 
        soundUrl={boardData?.company?.celebrationSoundUrl || null} 
      />

      <div 
        ref={containerRef}
        style={{ width: '1920px', height: '1080px', transform: `scale(${scale})`, transformOrigin: 'center center' }} 
        className={`${getThemeInnerClass()} font-sans flex flex-col p-6 bg-[length:100%_100%] bg-no-repeat relative shrink-0 transition-colors duration-1000`}
      >
        <div className={`absolute left-0 top-0 w-[800px] h-[800px] rounded-full blur-[120px] z-0 transition-colors duration-1000 ${getThemeGlowClass()}`}></div>
        <div className={`absolute right-0 bottom-0 w-[600px] h-[600px] rounded-full blur-[120px] z-0 transition-colors duration-1000 ${getThemeGlowClass()}`}></div>

        <Header />

        <main className="flex-1 grid grid-cols-12 gap-4 xl:gap-6 pb-2 min-h-0 z-10 relative">
          
          <LeaderboardTable activeAgents={activeAgents} />

          <div className="col-span-12 xl:col-span-5 flex flex-col justify-between gap-4 xl:gap-6 h-full overflow-hidden">
            <TeamGoalProgress teamGoal={teamGoal} />
            <DailyRecognition dailyRecognition={dailyRecognition} />
            <BellRinger firstName={bellRingerFirstName} lastName={bellRingerLastName} />
          </div>

        </main>

        <FooterMetrics />
      </div>
    </div>
  );
}
