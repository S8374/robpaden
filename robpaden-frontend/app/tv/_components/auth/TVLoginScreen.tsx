import { FormEvent } from "react";
import { Lock, ShieldCheck } from "lucide-react";

interface TVLoginScreenProps {
  inputPassword: string;
  setInputPassword: (val: string) => void;
  handlePasswordSubmit: (e: FormEvent) => void;
  isLoggingIn: boolean;
  blockedError: boolean;
  authError: string;
}

export function TVLoginScreen({
  inputPassword,
  setInputPassword,
  handlePasswordSubmit,
  isLoggingIn,
  blockedError,
  authError
}: TVLoginScreenProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030712] flex flex-col items-center justify-center text-white p-6 selection:bg-blue-500/30">
      
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[150px] mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen opacity-50" />
      </div>

      <div className="relative z-10 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-10 rounded-[2rem] flex flex-col items-center max-w-md w-full animate-in fade-in zoom-in-95 duration-700">
        
        {/* Icon Container */}
        <div className="relative w-20 h-20 mb-8 group">
          <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:bg-blue-500/30 transition-colors duration-500" />
          <div className="relative w-full h-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md">
            <Lock className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            Protected Access
          </h1>
          <p className="text-zinc-400 font-medium">
            Enter your TV Access Password to view the leaderboard.
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-5">
          <div className="relative group">
            <input 
              type="password" 
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Enter Password" 
              disabled={isLoggingIn}
              className="w-full px-5 py-4 bg-black/20 border border-white/10 text-white placeholder-white/30 rounded-xl text-lg focus:bg-black/40 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none backdrop-blur-md"
              autoFocus
            />
            <div className="absolute inset-0 rounded-xl border border-blue-500/0 group-focus-within:border-blue-500/20 pointer-events-none transition-colors duration-300" />
          </div>

          {/* Errors */}
          {blockedError ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />
              This device has been blocked or removed.
            </div>
          ) : authError ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />
              {authError}
            </div>
          ) : null}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoggingIn || !inputPassword}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-[0.98] mt-2 flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none group"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Access Board
                <ShieldCheck className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Subtle Footer */}
      <div className="absolute bottom-6 text-zinc-600 text-sm font-medium tracking-wider uppercase flex items-center gap-2">
        <span>Robpaden</span>
        <span className="w-1 h-1 rounded-full bg-zinc-700" />
        <span>Secure Access</span>
      </div>
    </div>
  );
}
