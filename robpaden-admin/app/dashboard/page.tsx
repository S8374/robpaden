"use client";

import { Building2, Users, UsersRound, TrendingUp, MoreHorizontal, MonitorPlay } from "lucide-react";
import { useGetOfficesQuery } from "@/redux/api/office.api";
import { useGetDashboardOverviewQuery } from "@/redux/api/dashboard.api";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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
    topOffice: null,
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
          <Link href="/dashboard/user-management" className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer inline-block">
            + New Manager
          </Link>
          <Link href="/dashboard/offices" className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer inline-block">
            + Create Office
          </Link>
        </div>
      </div>

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
            {isStatsLoading ? "..." : stats.totalOffices}
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
            {isStatsLoading ? "..." : stats.activeManagers}
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
            {isStatsLoading ? "..." : stats.totalAgents}
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
            {isStatsLoading ? "..." : stats.activeTVBoards}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-zinc-400">
             Across all offices
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Offices List */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
             <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-800">Offices Overview</h2>
                <Link href="/dashboard/offices" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 cursor-pointer">View All</Link>
             </div>
             <table className="w-full text-sm text-left">
                <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50">
                  <tr>
                    <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Office Name</th>
                    <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Managers</th>
                    <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Agents</th>
                    <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Status</th>
                    <th className="px-6 py-4 tracking-wider text-right border-b border-zinc-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {isOfficesLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                        Loading offices...
                      </td>
                    </tr>
                  ) : offices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                        No offices found.
                      </td>
                    </tr>
                  ) : (
                    offices.slice(0, 5).map((office) => (
                      <tr key={office.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-[10px]">
                              {office.name.substring(0, 2).toUpperCase()}
                            </div>
                            <p className="font-semibold text-zinc-900">{office.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-medium text-zinc-700">{office.managers?.length || 0}</td>
                        <td className="px-4 py-4 text-center font-medium text-zinc-500">{office.agents?.length || 0}</td>
                        <td className="px-4 py-4 text-center">
                           <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${office.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                             {office.status || 'Active'}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                             <Link href="/dashboard/offices" className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded hover:bg-zinc-100 cursor-pointer">
                               <MoreHorizontal className="w-4 h-4" />
                             </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
           </div>

           {/* Top Performers */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Top Office */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                 <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-bold text-zinc-800">Top Office (This Month)</h2>
                 </div>
                 {stats.topOffice ? (
                   <div className="flex flex-col items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 shadow-inner">
                         <Building2 className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-zinc-900 text-lg">{stats.topOffice.name}</h3>
                      <p className="text-zinc-500 text-sm font-medium mt-1">
                         <span className="text-emerald-600 font-bold">{stats.topOffice.sales}</span> Sales 
                         {stats.topOffice.goal > 0 && ` / ${stats.topOffice.goal} Goal`}
                      </p>
                   </div>
                 ) : (
                   <div className="text-sm text-zinc-500 text-center py-6 bg-zinc-50 rounded-xl border border-zinc-100">
                     No sales data this month.
                   </div>
                 )}
              </div>

              {/* Top Managers */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                 <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-bold text-zinc-800">Top Managers</h2>
                 </div>
                 {stats.topManagers && stats.topManagers.length > 0 ? (
                   <div className="space-y-3">
                     {stats.topManagers.map((manager: any, idx: number) => (
                       <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center font-bold text-zinc-700 text-[10px] shadow-sm">
                                {idx + 1}
                             </div>
                             <p className="font-semibold text-zinc-900 text-sm">{manager.name}</p>
                          </div>
                          <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                             {manager.sales} Sales
                          </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-sm text-zinc-500 text-center py-6 bg-zinc-50 rounded-xl border border-zinc-100">
                     No manager performance data.
                   </div>
                 )}
              </div>
           </div>

        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-6">
          
          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-bold text-zinc-800 mb-4">System Activity</h2>
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-y-auto p-5 space-y-4 max-h-[450px]">
               {stats.activities && stats.activities.length > 0 ? (
                 stats.activities.map((activity: any) => {
                   let Icon = Building2;
                   let iconColor = "text-blue-500";
                   if (activity.iconType === "Users") { Icon = Users; iconColor = "text-indigo-500"; }
                   if (activity.iconType === "UsersRound") { Icon = UsersRound; iconColor = "text-emerald-500"; }
                   if (activity.iconType === "MonitorPlay") { Icon = MonitorPlay; iconColor = "text-amber-500"; }
                   
                   return (
                    <div key={activity.id} className="flex gap-4">
                       <div className="mt-0.5">
                          <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                             <Icon className={`w-4 h-4 ${iconColor}`} />
                          </div>
                       </div>
                       <div>
                          <p className="text-sm font-semibold text-zinc-900">{activity.action}</p>
                          <p className="text-xs font-medium text-zinc-500 mt-0.5">{activity.entityName}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
                       </div>
                    </div>
                   );
                 })
               ) : (
                 <div className="text-sm text-zinc-500 text-center py-4">No recent activity</div>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
