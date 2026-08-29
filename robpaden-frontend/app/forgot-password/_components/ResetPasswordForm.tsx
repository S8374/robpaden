import { Loader2, Eye, EyeOff } from "lucide-react";

interface ResetPasswordFormProps {
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  isResetting: boolean;
  handleResetPassword: (e: React.FormEvent) => void;
}

export function ResetPasswordForm({
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  showPassword, setShowPassword,
  showConfirmPassword, setShowConfirmPassword,
  isResetting, handleResetPassword
}: ResetPasswordFormProps) {
  return (
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
  );
}
