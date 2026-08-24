"use client";

import { useState, useEffect } from "react";
import { useGetAgentsQuery } from "@/redux/api/agent.api";
import { useGetMeQuery } from "@/redux/api/auth.api";
import { AgentListTable } from "@/components/dashboard/agents/AgentListTable";
import { Users, UserCheck, UserMinus, ShieldAlert } from "lucide-react";
import { Header } from "@/components/dashboard/Header";

export default function AgentsPage() {
  const [isDemoLoading, setIsDemoLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsDemoLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const { data: agentsData, isLoading: agentsLoading } = useGetAgentsQuery({});
  const { data: meData, isLoading: meLoading } = useGetMeQuery({});
  
  const agents = agentsData?.data || [];
  const me = meData?.data || null;

  const totalAgents = agents.length;
  const activeAgents = agents.filter((a: any) => a.isActive).length;
  const deactivatedAgents = agents.filter((a: any) => !a.isActive).length;
  
  const agentLimit = me?.agentLimit;
  const limitText = agentLimit ? `${totalAgents} / ${agentLimit}` : `${totalAgents} (Unlimited)`;
  const usagePercent = agentLimit ? Math.min((totalAgents / agentLimit) * 100, 100) : 0;

  return (
    <div className="h-full flex flex-col bg-zinc-50">
      <Header title="Agents" />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
         
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
               </div>
               <div className="flex-1">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Agent Limit</p>
                  <p className="text-2xl font-bold text-zinc-900 mb-2">{limitText}</p>
                  {agentLimit && (
                    <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 75 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${usagePercent}%` }}
                      ></div>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Active Agents</p>
                  <p className="text-2xl font-bold text-zinc-900">{activeAgents}</p>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <UserMinus className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Deactivated</p>
                  <p className="text-2xl font-bold text-zinc-900">{deactivatedAgents}</p>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Performance</p>
                  <p className="text-sm font-medium text-zinc-500 mt-2">Metrics sync daily</p>
               </div>
            </div>
         </div>

         <AgentListTable agents={agents} isLoading={agentsLoading || meLoading || isDemoLoading} />
      </div>
    </div>
  );
}
