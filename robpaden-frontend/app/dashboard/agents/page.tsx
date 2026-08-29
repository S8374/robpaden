"use client";

import { AgentListTable } from "./_components/tables/AgentListTable";
import { Header } from "@/components/dashboard/layout/Header";
import { useAgents } from "./_hooks/useAgents";
import { AgentSummaryCards } from "./_components/ui/AgentSummaryCards";

export default function AgentsPage() {
  const { state, data, actions } = useAgents();

  return (
    <div className="h-full flex flex-col bg-zinc-50">
      <Header title="Agents" />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
         <AgentSummaryCards 
            limitText={data.limitText}
            agentLimit={data.agentLimit}
            usagePercent={data.usagePercent}
            activeAgents={data.activeAgents}
            deactivatedAgents={data.deactivatedAgents}
         />

         <AgentListTable 
            agents={data.agents} 
            isLoading={state.agentsLoading} 
         />
      </div>
    </div>
  );
}
