import { useEffect, useRef } from "react";
import gsap from "gsap";

export const CelebrationOverlay = ({ 
  isActive, 
  agentName,
  agentAvatarUrl,
  soundUrl,
  soundStartTime = 0,
  soundDuration = 10
}: { 
  isActive: boolean; 
  agentName: string;
  agentAvatarUrl?: string | null;
  soundUrl: string | null;
  soundStartTime?: number;
  soundDuration?: number;
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const boomRef = useRef<HTMLDivElement>(null);
  
  const audioRef = useRef<HTMLMediaElement | null>(null);

  const playAudio = () => {
    try {
      if (audioRef.current) {
        const audio = audioRef.current;
        audio.pause();
        audio.volume = 1.0;

        const startT = Number(soundStartTime) || 0;
        
        const attemptPlay = () => {
          try {
            // Only seek if we are far away from the start time, otherwise let it play instantly
            if (Math.abs(audio.currentTime - startT) > 0.5) {
              if (audio.duration && startT >= audio.duration) {
                audio.currentTime = 0;
              } else {
                audio.currentTime = startT;
              }
            }
          } catch(err) {
            console.error("Seek failed:", err);
          }

          try {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Autoplay prevented by browser. This is expected if there was no user interaction.
                // The visual animation will still play.
              });
            }
          } catch(err) {
            // Ignore play failure
          }
        };

        if (audio.readyState >= 1) { // HAVE_METADATA
          attemptPlay();
        } else {
          audio.addEventListener('loadedmetadata', attemptPlay, { once: true });
          audio.load();
        }
      }
    } catch(e) {
      console.error("Failed to play audio", e);
    }
  };

  // Pre-load and pre-seek audio to avoid buffering delay on play
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.src = soundUrl || "/sounds/bell_ring.mp3";
      audio.currentTime = Number(soundStartTime) || 0;
      audio.load();
    }
  }, [soundUrl, soundStartTime]);

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

      // Hide visuals after soundDuration with a smooth 1.5s fade
      const durationN = Number(soundDuration) || 10;
      fadeTimeoutId = setTimeout(() => {
        gsap.to(overlayRef.current, { opacity: 0, duration: 1.5, onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = "none";
        }});
      }, durationN * 1000);
      
      // Stop audio exactly when the visuals finish fading
      audioTimeoutId = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = Number(soundStartTime) || 0; // Pre-seek for next time
        }
      }, (durationN * 1000) + 1500);
    }

    return () => {
      if (fadeTimeoutId) clearTimeout(fadeTimeoutId);
      if (audioTimeoutId) clearTimeout(audioTimeoutId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = Number(soundStartTime) || 0;
      }
    };
  }, [isActive]);

  return (
    <>
      <video 
        ref={audioRef as any} 
        src={soundUrl || "/sounds/bell_ring.mp3"} 
        preload="auto" 
        className="hidden" 
        playsInline
      />
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
          {agentAvatarUrl ? (
            <div ref={avatarRef} className="w-32 h-32 xl:w-48 xl:h-48 rounded-full mb-8 shadow-[0_0_80px_rgba(59,130,246,0.8)] border-4 border-yellow-400 shrink-0 overflow-hidden">
               <img src={agentAvatarUrl} alt={agentName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div ref={avatarRef} className="w-32 h-32 xl:w-48 xl:h-48 rounded-full bg-white text-[#3b82f6] flex items-center justify-center text-4xl xl:text-6xl font-black mb-8 shadow-[0_0_80px_rgba(59,130,246,0.8)] border-4 border-yellow-400 shrink-0">
              {agentName ? agentName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : "AB"}
            </div>
          )}
          
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
