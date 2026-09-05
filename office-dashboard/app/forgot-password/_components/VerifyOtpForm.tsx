import { Loader2 } from "lucide-react";

interface VerifyOtpFormProps {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  isVerifying: boolean;
  handleVerifyOtp: (e: React.FormEvent) => void;
}

export function VerifyOtpForm({ email, otp, setOtp, isVerifying, handleVerifyOtp }: VerifyOtpFormProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Check Your Email</h1>
      <p className="text-sm text-gray-500 mb-8">
        We've sent a 6-digit verification code to <span className="font-semibold text-gray-800">{email}</span>.
      </p>
      
      <form onSubmit={handleVerifyOtp} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="otp" className="block text-[13px] font-medium text-gray-700">
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="------"
            className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white text-2xl tracking-[1em] text-center focus:outline-none focus:border-[#5252ff] focus:ring-1 focus:ring-[#5252ff] transition-all placeholder:text-gray-300 text-gray-900 font-mono"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          className="w-full bg-[#5252ff] hover:bg-[#4141cc] disabled:bg-[#5252ff]/70 text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
        >
          {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
        </button>
      </form>
    </div>
  );
}
