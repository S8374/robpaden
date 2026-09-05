import { useState, useEffect, useRef, FormEvent } from "react";
import { useGetTVBoardQuery, useTvLoginMutation } from "@/redux/api/tv.api";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";

export function useTVBoardData() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [password, setPassword] = useState<string | null>(null);
  const [inputPassword, setInputPassword] = useState("");
  
  const [deviceId, setDeviceId] = useState<string>("");
  const [deviceName, setDeviceName] = useState<string>("");

  const [authError, setAuthError] = useState("");
  const [blockedError, setBlockedError] = useState(false);

  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Celebration State
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [celebratingAgent, setCelebratingAgent] = useState("");
  const [celebratingAgentAvatarUrl, setCelebratingAgentAvatarUrl] = useState<string | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<{ id: number, name: string, avatarUrl: string | null }[]>([]);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const isAnimatingRef = useRef(false);
  const lastProcessedIdRef = useRef<number | null>(null);

  const [loginDevice, { isLoading: isLoggingIn }] = useTvLoginMutation();

  useEffect(() => {
    const initializeApp = async () => {
      const savedPassword = localStorage.getItem("tvPassword");
      if (savedPassword) setPassword(savedPassword);

      if (Capacitor.isNativePlatform()) {
        try {
          const info = await Device.getId();
          setDeviceId(info.identifier);
          
          const deviceInfo = await Device.getInfo();
          setDeviceName(`TV App (${deviceInfo.model || deviceInfo.operatingSystem})`);
        } catch (err) {
          setDeviceId("NATIVE_ERROR_" + Date.now());
          setDeviceName("Native App (Fallback)");
        }
      } else {
        let savedDeviceId = localStorage.getItem("tvDeviceId");
        if (!savedDeviceId) {
          savedDeviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          localStorage.setItem("tvDeviceId", savedDeviceId);
        }
        setDeviceId(savedDeviceId);

        let uaName = "Unknown Device";
        if (typeof navigator !== 'undefined') {
          const ua = navigator.userAgent;
          if (ua.includes("Windows")) uaName = "Windows Device";
          else if (ua.includes("Mac OS")) uaName = "Mac Device";
          else if (ua.includes("Linux")) uaName = "Linux Device";
          else if (ua.includes("Android")) uaName = "Android Device";
          else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) uaName = "iOS Device";
          
          if (ua.includes("Chrome")) uaName += " (Chrome)";
          else if (ua.includes("Firefox")) uaName += " (Firefox)";
          else if (ua.includes("Safari") && !ua.includes("Chrome")) uaName += " (Safari)";
          else if (ua.includes("Edge")) uaName += " (Edge)";
        }
        setDeviceName(uaName);
      }
      
      setIsInitializing(false);
    };

    initializeApp();
  }, []);

  // Poll the API every 10 seconds for live data
  const { data: response, error, isLoading } = useGetTVBoardQuery(
    { password: password || "", deviceId, deviceName },
    {
      skip: !password || !deviceId,
      pollingInterval: 3000, // Reduced from 10s to 3s for immediate updates
    }
  );

  useEffect(() => {
    // If API returns an error (e.g. 401, 403), reset password
    if (error) {
      setPassword(null);
      localStorage.removeItem("tvPassword");
      
      const isBlocked = (error as any)?.status === 403;
      setBlockedError(isBlocked);
    }
  }, [error]);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setBlockedError(false);
    
    if (inputPassword.trim()) {
      try {
        await loginDevice({ password: inputPassword, deviceId, deviceName }).unwrap();
        // Login success, set state so polling starts
        setPassword(inputPassword);
        localStorage.setItem("tvPassword", inputPassword);
      } catch (err: any) {
        if (err?.status === 403) {
          setBlockedError(true);
        } else {
          setAuthError(err?.data?.message || "Invalid password. Please try again.");
        }
      }
    }
  };

  // Audio Unlock State (Silent background)
  useEffect(() => {
    const handleGlobalClick = () => {
      const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
      silentAudio.volume = 0.01;
      silentAudio.play().catch(() => {});
      setIsAudioUnlocked(true);
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleGlobalClick);
      window.removeEventListener("touchstart", handleGlobalClick);
    };
    
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleGlobalClick);
    window.addEventListener("touchstart", handleGlobalClick);
    
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleGlobalClick);
      window.removeEventListener("touchstart", handleGlobalClick);
    };
  }, []);
  
  const boardData = response?.data;

  useEffect(() => {
    if (boardData?.recentSales) {
      if (lastProcessedIdRef.current === null) {
        // Initialize: just take the highest ID and don't animate anything on first load
        const highestId = Math.max(...boardData.recentSales.map((s: any) => s.id), 0);
        lastProcessedIdRef.current = highestId;
        return;
      }
      
      const newSales = boardData.recentSales.filter((s: any) => s.id > lastProcessedIdRef.current!);
      if (newSales.length > 0) {
        // Sort by ID ascending to queue them in order
        newSales.sort((a: any, b: any) => a.id - b.id);
        setCelebrationQueue(prev => [
          ...prev, 
          ...newSales.map((s: any) => ({
            id: s.id,
            name: s.name,
            avatarUrl: s.avatarUrl || null
          }))
        ]);
        // Update last processed ID
        const highestId = Math.max(...newSales.map((s: any) => s.id));
        lastProcessedIdRef.current = Math.max(lastProcessedIdRef.current!, highestId);
      }
    }
  }, [boardData?.recentSales]);

  // Queue processor
  useEffect(() => {
    const processQueue = () => {
      if (isAnimatingRef.current || celebrationQueue.length === 0) return;
      
      isAnimatingRef.current = true;
      const nextSale = celebrationQueue[0];
      
      // Delay the BOOM animation by 3 seconds so the Leaderboard shuffle animation
      // has time to play and be seen by the users before the screen is covered.
      setTimeout(() => {
        setCelebratingAgent(nextSale.name);
        setCelebratingAgentAvatarUrl(nextSale.avatarUrl);
        setCelebrationActive(true);
        
        // Calculate how long the animation takes
        const durationN = Number(boardData?.company?.celebrationSoundDuration) || 10;
        const totalAnimationTimeMs = (durationN * 1000) + 1600; // 1.5s fade out + tiny buffer
        
        setTimeout(() => {
          setCelebrationActive(false);
          // Add a small 500ms gap before popping the queue to ensure React toggles the state cleanly
          setTimeout(() => {
            setCelebrationQueue(prev => prev.slice(1));
            isAnimatingRef.current = false;
          }, 500);
        }, totalAnimationTimeMs);
      }, 3000);
    };

    processQueue();
  }, [celebrationQueue, celebrationActive, boardData?.company?.celebrationSoundDuration]);

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

  return {
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
    celebratingAgent,
    celebratingAgentAvatarUrl,
    isAudioUnlocked
  };
}
