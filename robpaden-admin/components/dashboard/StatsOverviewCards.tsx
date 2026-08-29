import React from "react";
import { Building2, Users, UsersRound, TrendingUp, MonitorPlay } from "lucide-react";

interface StatsOverviewCardsProps {
  stats: any;
  isLoading: boolean;
}

export function StatsOverviewCards({ stats, isLoading }: StatsOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Offices */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between h-36">
        <div className="flex items-start justify-between">
          <h3 className="text-zinc-500 font-medium text-sm">Total Offices</h3>
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-4xl font-bold text-zinc-900 tracking-tight">
          {isLoading ? "..." : stats.totalOffices}
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
          <TrendingUp className="w-3 h-3" />
          <span>+{stats.newOfficesThisMonth} this month</span>
        </div>
      </div>

      {/* Total Managers */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between h-36">
        <div className="flex items-start justify-between">
          <h3 className="text-zinc-500 font-medium text-sm">Active Managers</h3>
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-4xl font-bold text-zinc-900 tracking-tight">
          {isLoading ? "..." : stats.activeManagers}
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
          <TrendingUp className="w-3 h-3" />
          <span>+{stats.newManagersThisMonth} this month</span>
        </div>
      </div>

      {/* Total Agents */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between h-36">
        <div className="flex items-start justify-between">
          <h3 className="text-zinc-500 font-medium text-sm">Total Agents</h3>
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UsersRound className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-4xl font-bold text-zinc-900 tracking-tight">
          {isLoading ? "..." : stats.totalAgents}
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
          <TrendingUp className="w-3 h-3" />
          <span>+{stats.newAgentsThisMonth} this month</span>
        </div>
      </div>

      {/* Active TV Displays */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between h-36">
        <div className="flex items-start justify-between">
          <h3 className="text-zinc-500 font-medium text-sm">Active TV Boards</h3>
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <MonitorPlay className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-4xl font-bold text-zinc-900 tracking-tight">
          {isLoading ? "..." : stats.activeTVBoards}
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-zinc-400">
           Across all offices
        </div>
      </div>
    </div>
  );
}
