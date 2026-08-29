import { useState, useEffect } from "react";
import { useGetAgentsQuery } from "@/redux/api/agent.api";
import { useGetMeQuery } from "@/redux/api/auth.api";

export function useAgents() {
  const [isDemoLoading, setIsDemoLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsDemoLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const { data: agentsData, isLoading: agentsLoading, refetch: refetchAgents } = useGetAgentsQuery({});
  const { data: meData, isLoading: meLoading } = useGetMeQuery({});
  
  const agents = agentsData?.data || [];
  const me = meData?.data || null;

  const totalAgents = agents.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeAgents = agents.filter((a: any) => a.isActive).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deactivatedAgents = agents.filter((a: any) => !a.isActive).length;
  
  const agentLimit = me?.agentLimit;
  const limitText = agentLimit ? `${totalAgents} / ${agentLimit}` : `${totalAgents} (Unlimited)`;
  const usagePercent = agentLimit ? Math.min((totalAgents / agentLimit) * 100, 100) : 0;

  return {
    state: {
      isDemoLoading,
      agentsLoading,
      meLoading
    },
    data: {
      agents,
      me,
      totalAgents,
      activeAgents,
      deactivatedAgents,
      agentLimit,
      limitText,
      usagePercent
    },
    actions: {
      refetchAgents
    }
  };
}
