"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { LayoutDashboard, Users, FileText, Settings, LogOut, ChevronDown, MonitorPlay, History, Briefcase } from "lucide-react";
import { useLogoutMutation, useGetMeQuery } from "@/redux/api/auth.api";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const { data: profileData, isLoading } = useGetMeQuery({});
  const user = profileData?.data;
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      sessionStorage.removeItem("accessToken");
      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
      // Fallback
      sessionStorage.removeItem("accessToken");
      router.push("/");
    }
  };

  const isActive = (path: string) => {
    return pathname === path 
      ? "bg-zinc-100 text-zinc-900 font-medium" 
      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 font-medium";
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white border-r border-zinc-200">
      <div className="h-20 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <span className="font-bold text-white text-sm">RA</span>
          </div>
          <span className="font-bold text-lg text-zinc-900">Robpaden Admin</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5">
        <p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Main</p>
        <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/dashboard')}`}>
          <LayoutDashboard className={`w-5 h-5 ${pathname === '/dashboard' ? 'text-zinc-900' : 'text-zinc-500'}`} />
          Dashboard
        </Link>
        <div className="pt-4">
          <p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Management</p>
          <Link href="/dashboard/offices" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/dashboard/offices')}`}>
            <Briefcase className={`w-5 h-5 ${pathname === '/dashboard/offices' ? 'text-zinc-900' : 'text-zinc-500'}`} />
            Office Management
          </Link>
          <Link href="/dashboard/manager-management" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/dashboard/manager-management')}`}>
            <Users className={`w-5 h-5 ${pathname === '/dashboard/manager-management' ? 'text-zinc-900' : 'text-zinc-500'}`} />
            Manager Management
          </Link>
          <Link href="/dashboard/agent-management" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/dashboard/agent-management')}`}>
            <Users className={`w-5 h-5 ${pathname === '/dashboard/agent-management' ? 'text-zinc-900' : 'text-zinc-500'}`} />
            Agent Management
          </Link>
        </div>
        <div className="pt-4">
          <p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Configuration</p>
          <Link href="/dashboard/tv-themes" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/dashboard/tv-themes')}`}>
            <MonitorPlay className={`w-5 h-5 ${pathname === '/dashboard/tv-themes' ? 'text-zinc-900' : 'text-zinc-500'}`} />
            TV Themes
          </Link>
        </div>
      </nav>

      <div className="p-4 flex flex-col gap-1">
        <div 
          onClick={() => setIsProfileExpanded(!isProfileExpanded)}
          className="flex items-center justify-between px-3 py-3 mb-2 rounded-xl bg-zinc-50 border border-zinc-100 cursor-pointer hover:border-zinc-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-200 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-200 shadow-sm text-zinc-500 text-xs font-bold">
              {isLoading ? null : user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name || "Admin"} className="w-full h-full object-cover" />
              ) : (
                <span>{(user?.name || "A").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              {isLoading ? (
                <>
                  <div className="w-20 h-3 bg-zinc-200 rounded animate-pulse mb-1"></div>
                  <div className="w-12 h-2 bg-zinc-200 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold text-zinc-900 leading-tight truncate w-[100px]">{user?.name || "Super Admin"}</span>
                  <span className="text-xs text-zinc-500">System Administrator</span>
                </>
              )}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${isProfileExpanded ? 'rotate-180' : ''}`} />
        </div>

        {isProfileExpanded && (
          <div className="flex flex-col gap-1 mt-1 animate-in slide-in-from-top-2 fade-in duration-200">
            <Link 
              href="/dashboard/settings"
              onClick={() => setIsProfileExpanded(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 font-medium transition-colors"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 font-medium transition-colors text-left"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
