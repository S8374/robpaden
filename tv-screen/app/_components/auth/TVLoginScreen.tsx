import { FormEvent } from "react";
import { Lock, ArrowRight } from "lucide-react";

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
    <div className="w-screen h-screen bg-zinc-950 flex flex-col items-center justify-center font-sans text-zinc-100 selection:bg-blue-500/30 relative">
      
      {/* Optional faint grid background for a tech/professional feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-5 shadow-sm">
            <Lock className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            TV Board Access
          </h1>
          <p className="text-sm text-zinc-400">
            Enter your display password to authenticate this device.
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Access Password
            </label>
            <input 
              id="password"
              type="password" 
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="••••••••" 
              disabled={isLoggingIn}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-zinc-600"
              autoFocus
            />
          </div>

          {/* Errors */}
          {(blockedError || authError) && (
            <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-lg text-red-400 text-sm">
              {blockedError ? "This device has been blocked or removed." : authError}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoggingIn || !inputPassword}
            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Connect Display
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
