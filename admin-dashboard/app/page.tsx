"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/redux/api/auth.api";

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    // If already logged in on this tab, skip login page
    if (sessionStorage.getItem("accessToken")) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!email || !password) {
      setErrorMsg("Please enter both email and password");
      return;
    }
    
    try {
      const res = await login({ email, password }).unwrap();
      if (res.success) {
        if (res.data?.token) {
          console.log("Setting token:", res.data.token.substring(0, 10) + "...");
          sessionStorage.setItem("accessToken", res.data.token);
        }
        console.log("Redirecting to dashboard...");
        // Force full page navigation to clear any cached states
        window.location.href = "/dashboard";
      } else {
        setErrorMsg(res.message || "Login failed");
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error?.message || err?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-zinc-900 font-sans antialiased selection:bg-blue-600/30">
      
      {/* Left Side - Image and Copy */}
      <div className="hidden lg:flex lg:w-[70%] relative flex-col justify-between p-12 lg:p-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/call_center_bg.png"
            alt="High-energy modern call center"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          {/* Gradient Overlay for text readability */}
        </div>

        {/* Top spacing */}
        <div className="relative z-10"></div>

        {/* Middle Content */}
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl lg:text-[4rem] font-heading font-extrabold tracking-tight leading-[1.1] mb-6 text-white">
            Supercharge your <br />
            <span className="text-blue-500">sales operations.</span>
          </h1>
          <p className="text-lg text-zinc-300 max-w-lg leading-relaxed font-medium">
            Access the command center to manage agents, monitor real-time sales
            metrics, and motivate your call center effortlessly.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-950/60 flex items-center justify-center border border-white/10 backdrop-blur-md">
            <span className="text-sm font-bold">N</span>
          </div>
          <p className="text-sm text-zinc-400 font-medium tracking-wide">
            © {new Date().getFullYear()} Robpaden Call Center.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[30%] flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 bg-white border-l border-zinc-200">
        <div className="w-full max-w-[340px] space-y-10">
          
          {/* Logo Placeholder */}
          <div className="flex flex-col items-center justify-center mb-6">
             <div className="text-blue-600 mb-1">
                {/* Custom SVG Logo */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 22L12 18L20 22V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 14L8 10L12 6" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
             <span className="text-blue-600 font-heading font-bold text-lg tracking-wider">Robpaden</span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-[28px] font-heading font-bold text-zinc-900 tracking-tight">Welcome back</h2>
            <p className="text-zinc-500 text-sm">Enter your credentials to access the dashboard</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md border border-red-100 text-center">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all duration-200 text-zinc-900 placeholder-zinc-400 text-sm [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#fafafa_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black] cursor-text"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-10 py-3.5 rounded bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all duration-200 text-zinc-900 placeholder-zinc-400 text-sm [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#fafafa_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black] cursor-text"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 text-white font-semibold py-3.5 px-4 rounded transition-all duration-200 flex items-center justify-center gap-2 mt-6 active:scale-[0.98] shadow-sm hover:shadow cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign in 
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
