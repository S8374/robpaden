"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { LayoutDashboard, Users, FileText, Settings, LogOut, ChevronDown, MonitorPlay, History, Briefcase } from "lucide-react";
import { useLogoutMutation } from "@/redux/api/auth.api";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shadow-sm">
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
          <Link href="/dashboard/user-management" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/dashboard/user-management')}`}>
            <Users className={`w-5 h-5 ${pathname === '/dashboard/user-management' ? 'text-zinc-900' : 'text-zinc-500'}`} />
            User Management
          </Link>
        </div>
        <div className="pt-4">
          <p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Configuration</p>
          <Link href="#" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 font-medium transition-colors">
            <div className="flex items-center gap-3">
              <MonitorPlay className="w-5 h-5" />
              TV Themes
            </div>
          </Link>
        </div>
      </nav>

      <div className="p-4 flex flex-col gap-1">
        <div className="flex items-center justify-between px-3 py-3 mb-2 rounded-xl bg-zinc-50 border border-zinc-100 cursor-pointer hover:border-zinc-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-200 overflow-hidden">
              {/* Placeholder for avatar */}
              <div className="w-full h-full bg-zinc-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-900 leading-tight">Super Admin</span>
              <span className="text-xs text-zinc-500">System Administrator</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        </div>

        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 font-medium transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 font-medium transition-colors text-left">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
