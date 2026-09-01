"use client";

import Link from "next/link";
import { ArrowLeft, Users, Activity, Shield, Mail, Target, BarChart } from "lucide-react";
import { ManagerActivityTimeline } from "./_components/timelines/ManagerActivityTimeline";
import { AgentActivityTimeline } from "./_components/timelines/AgentActivityTimeline";
import { UserProfileCard } from "./_components/ui/UserProfileCard";
import { SalesHistoryTable } from "./_components/tables/SalesHistoryTable";
import { ManagedAgentsTable } from "./_components/tables/ManagedAgentsTable";
import { useUserDetails } from "./_hooks/useUserDetails";
import { useRouter } from "next/navigation";

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { state, actions } = useUserDetails(params);
  const router = useRouter();

  if (state.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (state.isError || !state.user) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium">Failed to load user details or user not found.</p>
        <Link href="/dashboard/manager-management" className="text-indigo-600 hover:underline mt-4 inline-block">
          Return to Manager Management
        </Link>
      </div>
    );
  }

  const { user } = state;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 h-full">
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">User Details</h1>
          <p className="text-sm text-zinc-500 mt-1">Viewing full profile and assigned resources.</p>
        </div>
      </div>

      <UserProfileCard user={user} />

      {/* Role Specific Content */}
      {user.role === "MANAGER" && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-px">
            <button
              onClick={() => actions.setActiveTab('agents')}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors relative cursor-pointer ${
                state.activeTab === 'agents' ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Managed Agents
              {state.activeTab === 'agents' && (
                <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
              )}
            </button>
            <button
              onClick={() => actions.setActiveTab('salesHistory')}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors relative cursor-pointer ${
                state.activeTab === 'salesHistory' ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Sales History
              {state.activeTab === 'salesHistory' && (
                <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
              )}
            </button>
            <button
              onClick={() => actions.setActiveTab('activity')}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors relative cursor-pointer ${
                state.activeTab === 'activity' ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Activity History
              {state.activeTab === 'activity' && (
                <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
              )}
            </button>
          </div>

          {state.activeTab === 'agents' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ManagedAgentsTable 
                agents={user.agents} 
                router={actions.router} 
                handleToggleStatus={actions.handleToggleStatus} 
                handleDeleteAgent={actions.handleDeleteAgent} 
              />
            </div>
          )}

          {state.activeTab === 'salesHistory' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SalesHistoryTable 
                salesHistory={(user as any).salesHistory || []} 
                selectedMonth={state.selectedMonth}
                selectedYear={state.selectedYear}
                onMonthChange={actions.setSelectedMonth}
                onYearChange={actions.setSelectedYear}
              />
            </div>
          )}
          
          {state.activeTab === 'activity' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ManagerActivityTimeline 
                managerId={user.id} 
                selectedMonth={state.selectedMonth}
                selectedYear={state.selectedYear}
                onMonthChange={actions.setSelectedMonth}
                onYearChange={actions.setSelectedYear}
              />
            </div>
          )}
        </div>
      )}

      {user.role === "AGENT" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manager Details */}
          <div className="group relative overflow-hidden bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 group-hover:bg-blue-100 transition-colors"></div>
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-100/60">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                   <Shield className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-zinc-900 text-lg tracking-tight">Manager Details</h3>
              </div>
              {user.manager ? (
                <div className="flex items-center gap-4 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100/50 group-hover:border-blue-100/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-600 font-bold uppercase text-lg shadow-inner">
                    {user.manager.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-[15px]">{user.manager.name}</p>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.manager.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 bg-zinc-50/50 rounded-xl border border-zinc-100 border-dashed">
                  <p className="text-sm font-medium text-zinc-500">No manager assigned</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Agent Goals */}
          <div className="group relative overflow-hidden bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 group-hover:bg-amber-100 transition-colors"></div>
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-100/60">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/20">
                   <Target className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-zinc-900 text-lg tracking-tight">Agent Goals</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-gradient-to-b from-white to-zinc-50/80 border border-zinc-100 rounded-xl text-center group-hover:border-amber-100/50 transition-colors">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Daily</p>
                  <p className="text-2xl font-black text-zinc-800">{user.dailyGoal || 0}</p>
                </div>
                <div className="p-4 bg-gradient-to-b from-white to-zinc-50/80 border border-zinc-100 rounded-xl text-center group-hover:border-amber-100/50 transition-colors">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Weekly</p>
                  <p className="text-2xl font-black text-zinc-800">{user.weeklyGoal || 0}</p>
                </div>
                <div className="p-4 bg-gradient-to-b from-white to-zinc-50/80 border border-zinc-100 rounded-xl text-center group-hover:border-amber-100/50 transition-colors">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Monthly</p>
                  <p className="text-2xl font-black text-zinc-800">{user.monthlyGoal || 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Performance */}
          <div className="md:col-span-2 group relative overflow-hidden bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 group-hover:bg-emerald-100 transition-colors pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-20 -mb-20 opacity-60 group-hover:bg-indigo-100 transition-colors pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-100/60">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                   <BarChart className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-zinc-900 text-lg tracking-tight">Current Performance</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden p-5 bg-white border border-emerald-100/60 rounded-xl group-hover:border-emerald-200 transition-colors shadow-sm shadow-emerald-500/5">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100/80 to-emerald-50/50 opacity-50 rounded-bl-full pointer-events-none"></div>
                  <div className="relative">
                    <p className="text-xs text-emerald-600/80 font-bold uppercase tracking-wider mb-2">Today's Sales</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-emerald-600 leading-none">{user.performance?.daily || 0}</p>
                      <span className="text-sm font-semibold text-emerald-600/60 mb-1">/ {user.dailyGoal || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden p-5 bg-white border border-indigo-100/60 rounded-xl group-hover:border-indigo-200 transition-colors shadow-sm shadow-indigo-500/5">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100/80 to-indigo-50/50 opacity-50 rounded-bl-full pointer-events-none"></div>
                  <div className="relative">
                    <p className="text-xs text-indigo-600/80 font-bold uppercase tracking-wider mb-2">This Week</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-indigo-600 leading-none">{user.performance?.weekly || 0}</p>
                      <span className="text-sm font-semibold text-indigo-600/60 mb-1">/ {user.weeklyGoal || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden p-5 bg-white border border-purple-100/60 rounded-xl group-hover:border-purple-200 transition-colors shadow-sm shadow-purple-500/5">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100/80 to-purple-50/50 opacity-50 rounded-bl-full pointer-events-none"></div>
                  <div className="relative">
                    <p className="text-xs text-purple-600/80 font-bold uppercase tracking-wider mb-2">This Month</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-purple-600 leading-none">{user.performance?.monthly || 0}</p>
                      <span className="text-sm font-semibold text-purple-600/60 mb-1">/ {user.monthlyGoal || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <SalesHistoryTable 
            salesHistory={(user as any).salesHistory || []} 
            selectedMonth={state.selectedMonth}
            selectedYear={state.selectedYear}
            onMonthChange={actions.setSelectedMonth}
            onYearChange={actions.setSelectedYear}
          />

          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm md:col-span-2">
             <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-zinc-900">Manager Actions (Audit)</h3>
             </div>
             
             <AgentActivityTimeline agentId={user.id} />
          </div>
        </div>
      )}
    </div>
  );
}
