import { Bell, Menu } from "lucide-react";
import React from "react";
import { useSidebar } from "@/components/dashboard/SidebarContext";

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function Header({ title, action }: HeaderProps) {
  const { setIsOpen } = useSidebar();

  return (
    <div className="flex-none px-4 md:px-8 py-4 flex items-center justify-between border-b border-zinc-200 bg-white">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsOpen(true)}
          className="xl:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {action && (
          <div className="flex items-center">
            {action}
          </div>
        )}
        <button className="p-2 bg-white cursor-pointer rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors text-zinc-500 hover:text-zinc-900 shadow-sm">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
