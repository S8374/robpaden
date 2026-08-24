"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "@/redux/api/auth.api";

type Step = "REQUEST_OTP" | "VERIFY_OTP" | "RESET_PASSWORD";

export default function ForgotPassword() {
  const router = useRouter();
  
  const [step, setStep] = useState<Step>("REQUEST_OTP");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [forgotPassword, { isLoading: isRequesting }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    
    try {
      const res = await forgotPassword({ email }).unwrap();
      if (res.success) {
        toast.success("OTP sent to your email!");
        setStep("VERIFY_OTP");
      }
    } catch (err: any) {
      const msg = err?.data?.error?.message || err?.data?.message || err?.message || "Failed to send OTP.";
      toast.error(msg);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    
    try {
      const res = await verifyOtp({ email, otp }).unwrap();
      if (res.success && res.data?.token) {
        setResetToken(res.data.token);
        toast.success("OTP verified successfully.");
        setStep("RESET_PASSWORD");
      }
    } catch (err: any) {
      const msg = err?.data?.error?.message || err?.data?.message || err?.message || "Invalid OTP.";
      toast.error(msg);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    try {
      const res = await resetPassword({ token: resetToken, password: newPassword }).unwrap();
      if (res.success) {
        toast.success("Password reset successfully! You can now log in.");
        router.push("/");
      }
    } catch (err: any) {
      const msg = err?.data?.error?.message || err?.data?.message || err?.message || "Failed to reset password.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center relative overflow-hidden font-sans p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 -ml-20 -mt-20 w-[600px] h-[600px] rounded-full bg-[#f0f2fb] opacity-80 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px] p-8 sm:p-10 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => step === "REQUEST_OTP" ? router.push("/") : setStep("REQUEST_OTP")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        {step === "REQUEST_OTP" && (
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
        )}

        {step === "VERIFY_OTP" && (
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
        )}

        {step === "RESET_PASSWORD" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Create New Password</h1>
            <p className="text-sm text-gray-500 mb-8">
              Your new password must be at least 6 characters long.
            </p>
            
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#5252ff] focus:ring-1 focus:ring-[#5252ff] transition-all placeholder:text-gray-400 text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#5252ff] focus:ring-1 focus:ring-[#5252ff] transition-all placeholder:text-gray-400 text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="w-full bg-[#5252ff] hover:bg-[#4141cc] disabled:bg-[#5252ff]/70 text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
              >
                {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
