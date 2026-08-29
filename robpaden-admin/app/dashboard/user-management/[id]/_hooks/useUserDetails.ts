import { useState, use } from "react";
import { useGetUserDetailsQuery, useDeleteUserMutation, useToggleUserStatusMutation } from "@/redux/api/user.api";
import { useRouter } from "next/navigation";

export function useUserDetails(params: Promise<{ id: string }>) {
  const unwrappedParams = use(params);
  const userId = parseInt(unwrappedParams.id, 10);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'agents' | 'activity'>('agents');
  
  const { data, isLoading, isError } = useGetUserDetailsQuery(userId, {
    skip: isNaN(userId),
  });

  const [deleteUser] = useDeleteUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();

  const handleDeleteAgent = async (agentId: number) => {
    if (confirm("Are you sure you want to delete this agent? This cannot be undone.")) {
      await deleteUser(agentId);
    }
  };

  const handleToggleStatus = async (agentId: number, currentStatus: boolean) => {
    await toggleStatus({ id: agentId, isActive: !currentStatus });
  };

  const user = data?.data;

  return {
    state: {
      userId,
      user,
      isLoading,
      isError,
      activeTab,
    },
    actions: {
      setActiveTab,
      handleDeleteAgent,
      handleToggleStatus,
      router,
    }
  };
}
