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
  const prevSaleIdRef = useRef<number | null>(null);

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
      pollingInterval: 10000,
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
  
  const boardData = response?.data;

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
    celebratingAgent
  };
}
