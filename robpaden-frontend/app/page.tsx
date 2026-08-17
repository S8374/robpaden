"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
// import { useLoginMutation } from "@/redux/api/auth.api";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [branding, setBranding] = useState<{name: string, logoUrl: string | null} | null>(null);
  const [isBrandingLoading, setIsBrandingLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // const [login] = useLoginMutation();

  useEffect(() => {
    // If already logged in on this tab, skip login page
    if (sessionStorage.getItem("accessToken")) {
      router.replace("/dashboard");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const officeId = params.get("officeId");
    
    if (officeId) {
      // Fetch public branding from backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";
      fetch(`${apiUrl}/auth/branding/${officeId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setBranding(data.data);
          }
        })
        .catch(err => console.error("Failed to fetch branding:", err))
        .finally(() => setIsBrandingLoading(false));
    } else {
      setIsBrandingLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // DEMO MODE: Bypass backend authentication
    setIsLoading(true);
    setTimeout(() => {
      sessionStorage.setItem("accessToken", "demo-token-bypass");
      router.push("/dashboard");
    }, 500); // Small delay to show loading state for demo purposes

    /*
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await login({ email, password }).unwrap();
      
      if (res.success) {
        if (res.data?.token) {
          sessionStorage.setItem("accessToken", res.data.token);
        }
        router.push("/dashboard");
      } else {
        toast.error(res.message || "Invalid credentials.");
      }
    } catch (err: any) {
      const extractedMessage = err?.data?.error?.message || err?.data?.message || err?.message || "Something went wrong.";
      toast.error(extractedMessage);
    } finally {
      setIsLoading(false);
    }
    */
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-[#f0f2fb] opacity-80 pointer-events-none" />
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] p-8 sm:p-10 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {/* Logo */}
        <div className={`flex justify-center mb-2 items-end ${branding || isBrandingLoading ? 'min-h-[96px]' : ''}`}>
          {isBrandingLoading ? (
            <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
          ) : branding?.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.name} className="h-24 max-w-[280px] w-full object-contain" />
          ) : branding ? (
            <div className="w-16 h-16 rounded-full bg-[#5252ff] flex items-center justify-center text-white text-2xl font-bold">
              {branding.name.substring(0, 1).toUpperCase()}
            </div>
          ) : null}
        </div>

        {/* Header */}
        <div className="text-center mb-8 h-[52px]">
          {isBrandingLoading ? (
            <>
              <div className="h-7 bg-gray-200 rounded-md w-48 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded-md w-32 mx-auto animate-pulse"></div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                {branding ? `${branding.name} Dashboard` : "Office Dashboard"}
              </h1>
              <p className="text-sm text-gray-500">
                Sign in to manage sales and reports
              </p>
            </>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[13px] font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@officea.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#5252ff] focus:ring-1 focus:ring-[#5252ff] transition-all placeholder:text-gray-400 text-gray-900"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-[13px] font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#5252ff] focus:ring-1 focus:ring-[#5252ff] transition-all placeholder:text-gray-400 text-gray-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-[#5252ff] focus:ring-[#5252ff]/20 focus:ring-offset-0 transition-all cursor-pointer"
              />
              <span className="text-[13px] text-gray-600 font-medium select-none">Remember me</span>
            </label>
            <button type="button" className="text-[13px] font-semibold text-[#5252ff] hover:text-[#4141cc] transition-colors">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#5252ff] hover:bg-[#4141cc] disabled:bg-[#5252ff]/70 text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center px-4">
          <p className="text-[11px] text-gray-400 leading-relaxed max-w-[280px] mx-auto">
            Secure access for authorized managers only. Contact your administrator if you've lost access.
          </p>
        </div>
      </div>
    </div>
  );
}
