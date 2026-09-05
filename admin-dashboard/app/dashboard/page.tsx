"use client";

import { useGetOfficesQuery } from "@/redux/api/office.api";
import { useGetDashboardOverviewQuery } from "@/redux/api/dashboard.api";
import Link from "next/link";

import { StatsOverviewCards } from "@/components/dashboard/StatsOverviewCards";
import { OfficesOverviewTable } from "@/components/dashboard/OfficesOverviewTable";
import { TopPerformersTables } from "@/components/dashboard/TopPerformersTables";
import { SystemActivityFeed } from "@/components/dashboard/SystemActivityFeed";

export default function DashboardPage() {
  const { data: statsData, isLoading: isStatsLoading } = useGetDashboardOverviewQuery();
  const { data: officesData, isLoading: isOfficesLoading } = useGetOfficesQuery();

  const stats = statsData?.data || {
    totalOffices: 0,
    newOfficesThisMonth: 0,
    activeManagers: 0,
    newManagersThisMonth: 0,
    totalAgents: 0,
    newAgentsThisMonth: 0,
    activeTVBoards: 0,
    activities: [],
    topOffices: [],
    topManagers: []
  };

  const offices = officesData?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">System Overview</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage all offices, managers, and system settings.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/manager-management" className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer inline-block">
            + New Manager
          </Link>
          <Link href="/dashboard/offices" className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer inline-block">
            + Create Office
          </Link>
        </div>
      </div>

      <StatsOverviewCards stats={stats} isLoading={isStatsLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Offices List */}
        <div className="xl:col-span-2 space-y-6">
          <OfficesOverviewTable offices={offices} isLoading={isOfficesLoading} />
          <TopPerformersTables topOffices={(stats as any).topOffices} topManagers={(stats as any).topManagers} />
        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-6">
          <SystemActivityFeed activities={stats.activities} />
        </div>
      </div>
    </div>
  );
}
