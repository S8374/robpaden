import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "@/redux/api/auth.api";

export type Step = "REQUEST_OTP" | "VERIFY_OTP" | "RESET_PASSWORD";

export function useForgotPassword() {
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

  return {
    state: {
      step,
      email,
      otp,
      newPassword,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      isRequesting,
      isVerifying,
      isResetting,
    },
    actions: {
      setStep,
      setEmail,
      setOtp,
      setNewPassword,
      setConfirmPassword,
      setShowPassword,
      setShowConfirmPassword,
      handleRequestOtp,
      handleVerifyOtp,
      handleResetPassword,
      router,
    }
  };
}
