"use client";

import { ArrowLeft } from "lucide-react";
import { useForgotPassword } from "./_hooks/useForgotPassword";
import { RequestOtpForm } from "./_components/RequestOtpForm";
import { VerifyOtpForm } from "./_components/VerifyOtpForm";
import { ResetPasswordForm } from "./_components/ResetPasswordForm";

export default function ForgotPassword() {
  const { state, actions } = useForgotPassword();

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center relative overflow-hidden font-sans p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 -ml-20 -mt-20 w-[600px] h-[600px] rounded-full bg-[#f0f2fb] opacity-80 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px] p-8 sm:p-10 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => state.step === "REQUEST_OTP" ? actions.router.push("/") : actions.setStep("REQUEST_OTP")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        {state.step === "REQUEST_OTP" && (
          <RequestOtpForm 
            email={state.email}
            setEmail={actions.setEmail}
            isRequesting={state.isRequesting}
            handleRequestOtp={actions.handleRequestOtp}
          />
        )}

        {state.step === "VERIFY_OTP" && (
          <VerifyOtpForm 
            email={state.email}
            otp={state.otp}
            setOtp={actions.setOtp}
            isVerifying={state.isVerifying}
            handleVerifyOtp={actions.handleVerifyOtp}
          />
        )}

        {state.step === "RESET_PASSWORD" && (
          <ResetPasswordForm 
            newPassword={state.newPassword}
            setNewPassword={actions.setNewPassword}
            confirmPassword={state.confirmPassword}
            setConfirmPassword={actions.setConfirmPassword}
            showPassword={state.showPassword}
            setShowPassword={actions.setShowPassword}
            showConfirmPassword={state.showConfirmPassword}
            setShowConfirmPassword={actions.setShowConfirmPassword}
            isResetting={state.isResetting}
            handleResetPassword={actions.handleResetPassword}
          />
        )}
      </div>
    </div>
  );
}
