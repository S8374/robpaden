import { useState, use } from "react";
import { useGetUserDetailsQuery, useDeleteUserMutation, useToggleUserStatusMutation } from "@/redux/api/user.api";
import { useRouter } from "next/navigation";

export function useUserDetails(params: Promise<{ id: string }>) {
  const unwrappedParams = use(params);
  const userId = parseInt(unwrappedParams.id, 10);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'agents' | 'salesHistory' | 'activity' | 'reports'>('agents');
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const { data, isLoading, isError, refetch } = useGetUserDetailsQuery({ 
    id: userId, 
    month: selectedMonth, 
    year: selectedYear 
  }, {
    skip: isNaN(userId),
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
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
      selectedMonth,
      selectedYear,
    },
    actions: {
      setActiveTab,
      handleDeleteAgent,
      handleToggleStatus,
      setSelectedMonth,
      setSelectedYear,
      router,
      refetch,
    }
  };
}
