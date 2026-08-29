import { Loader2 } from "lucide-react";

interface RequestOtpFormProps {
  email: string;
  setEmail: (email: string) => void;
  isRequesting: boolean;
  handleRequestOtp: (e: React.FormEvent) => void;
}

export function RequestOtpForm({ email, setEmail, isRequesting, handleRequestOtp }: RequestOtpFormProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Forgot Password</h1>
      <p className="text-sm text-gray-500 mb-8">
        Enter your email address and we'll send you a code to reset your password.
      </p>
      
      <form onSubmit={handleRequestOtp} className="space-y-5">
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
        <button
          type="submit"
          disabled={isRequesting}
          className="w-full bg-[#5252ff] hover:bg-[#4141cc] disabled:bg-[#5252ff]/70 text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
        >
          {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Code"}
        </button>
      </form>
    </div>
  );
}
