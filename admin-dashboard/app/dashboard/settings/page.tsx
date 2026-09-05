"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Loader2, User, Lock, Save, Eye, EyeOff } from "lucide-react";
import { useGetMeQuery, useUpdateProfileMutation, useUploadAvatarMutation } from "@/redux/api/auth.api";

function PersonalDetailsForm({ user, refetch }: { user: any, refetch: () => void }) {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar] = useUploadAvatarMutation();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size should not exceed 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadAvatar(formData).unwrap();
      
      if (response.success && response.url) {
        setAvatarUrl(response.url);
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await updateProfile({
        name,
        avatarUrl,
      }).unwrap();

      setSuccess("Personal details updated successfully!");
      refetch();
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Failed to update profile");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-6 w-full">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900">Personal Details</h2>
          <p className="text-xs text-zinc-500">Update your photo and personal details.</p>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-zinc-100">
            <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-full overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center text-zinc-400 shadow-sm">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-zinc-400">
                    {(name || user?.name || "A").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="absolute inset-0 bg-blue-950/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <Upload className="w-4 h-4 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Profile Picture</h3>
              <p className="text-xs text-zinc-500 max-w-sm mb-3">
                Upload a professional photo. Maximum size: 5MB.
              </p>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-md hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer"
              >
                Choose Image
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm text-zinc-900 placeholder:text-zinc-400"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-500 cursor-not-allowed"
              />
              <p className="text-xs text-zinc-400 mt-1.5">Email address cannot be changed.</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating || isUploading}
              className="px-4 py-2 bg-[#09090b] hover:bg-[#27272a] text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SecurityForm({ user, refetch }: { user: any, refetch: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      await updateProfile({
        password
      }).unwrap();

      setSuccess("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Failed to update password");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-8 w-full">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900">Security</h2>
          <p className="text-xs text-zinc-500">Update your password to keep your account secure.</p>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm text-zinc-900 placeholder:text-zinc-400"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm text-zinc-900 placeholder:text-zinc-400"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating || !password || !confirmPassword}
              className="px-4 py-2 bg-[#09090b] hover:bg-[#27272a] text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: profileData, isLoading, refetch } = useGetMeQuery({});
  const user = profileData?.data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 w-full max-w-full">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-zinc-900">Account Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your admin profile and security.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="space-y-6">
          <PersonalDetailsForm user={user} refetch={refetch} />
          <SecurityForm user={user} refetch={refetch} />
        </div>
      )}
    </div>
  );
}
