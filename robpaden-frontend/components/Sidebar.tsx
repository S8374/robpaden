"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, ChevronDown, Network, X } from "lucide-react";
import { useState } from "react";
import { useGetMeQuery } from "@/redux/api/auth.api";
import { useSidebar } from "@/components/dashboard/layout/SidebarContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const { data: profileData, isLoading } = useGetMeQuery({});
  const user = profileData?.data;
  
  const { isOpen, setIsOpen } = useSidebar();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Agents", href: "/dashboard/agents", icon: Users },

    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  ];

  const handleConfirmLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    router.push("/");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex-col bg-white border-r border-zinc-200 h-full transform transition-transform duration-300 ease-in-out xl:relative xl:translate-x-0 flex ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
          {isLoading ? (
            <div className="w-8 h-8 rounded-lg bg-zinc-200 animate-pulse shrink-0"></div>
          ) : user?.company?.settings?.logoUrl ? (
            <img src={user.company.settings.logoUrl} alt={user.company.name || "Office"} className="w-20 h-20 rounded-md object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shadow-sm text-white font-bold text-sm shrink-0">
              {(user?.company?.name || "O").substring(0, 2).toUpperCase()}
            </div>
          )}
            <span className="font-bold text-lg text-zinc-900 truncate">
              {isLoading ? "Loading..." : user?.company?.name || "Office A"}
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="xl:hidden p-2 -mr-2 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5">
        <p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Main</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/dashboard");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
                isActive 
                  ? "bg-zinc-100 text-zinc-900" 
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Area */}
      <div className="p-4 flex flex-col gap-1">
        <div 
          onClick={() => setIsProfileExpanded(!isProfileExpanded)}
          className="flex items-center justify-between px-3 py-3 rounded-xl bg-zinc-50 border border-zinc-100 cursor-pointer hover:border-zinc-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-200 overflow-hidden shrink-0 flex items-center justify-center text-zinc-500 text-xs font-bold">
              {isLoading ? null : <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt={user?.name || "Manager"} className="w-full h-full object-cover" />}
            </div>
            <div className="flex flex-col min-w-0">
              {isLoading ? (
                <>
                  <div className="w-20 h-3 bg-zinc-200 rounded animate-pulse mb-1"></div>
                  <div className="w-12 h-2 bg-zinc-200 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold text-zinc-900 leading-tight truncate w-[100px]">{user?.name || "Manager"}</span>
                  <span className="text-xs text-zinc-500 capitalize">{user?.role ? user.role.toLowerCase().replace("_", " ") : "Manager"}</span>
                </>
              )}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${isProfileExpanded ? 'rotate-180' : ''}`} />
        </div>

        {isProfileExpanded && (
          <div className="flex flex-col gap-1 mt-1 animate-in slide-in-from-top-2 fade-in duration-200">
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 font-medium transition-colors">
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <button 
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 font-medium transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>

    {/* Logout Confirmation Modal */}
    {isLogoutModalOpen && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-[360px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6 ml-1" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg mb-2">Are you sure?</h3>
            <p className="text-sm text-zinc-500 mb-6">
              You will be logged out of your account.
            </p>
            
            <div className="flex w-full gap-3">
              <button 
                onClick={handleConfirmLogout}
                className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm cursor-pointer"
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 font-semibold py-2.5 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
