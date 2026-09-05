import { useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  useGetAgentsQuery, 
  useAddDailySalesMutation,
  useGetAgentTodayAuditQuery,
  useReverseSaleMutation,
  useEditSaleMutation
} from "@/redux/api/agent.api";

export function useAgentsTable(isLoadingProp?: boolean, date?: string) {
  // Add Sale State
  const [selectedAgent, setSelectedAgent] = useState<{ id: number; name: string; initials: string } | null>(null);
  const [saleCount, setSaleCount] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Correction Sidebar State
  const [correctAgent, setCorrectAgent] = useState<{ id: number; name: string; initials: string; today: number } | null>(null);
  const [expandedTx, setExpandedTx] = useState<number | null>(null);
  
  // Correction Modals State
  const [reverseSale, setReverseSale] = useState<any>(null);
  const [editSale, setEditSale] = useState<any>(null);
  const [editCount, setEditCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: agentsData, isLoading: queryLoading } = useGetAgentsQuery(date ? { date } : {});
  const agentsList = agentsData?.data || [];
  
  const [addDailySales] = useAddDailySalesMutation();
  const [reverseSaleMutation] = useReverseSaleMutation();
  const [editSaleMutation] = useEditSaleMutation();

  const { data: auditData, isLoading: auditLoading } = useGetAgentTodayAuditQuery({ agentId: correctAgent?.id, date }, {
    skip: !correctAgent?.id,
  });
  
  const transactions = auditData?.data?.map((tx: any) => ({
    id: tx.id,
    count: tx.amount,
    time: new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    by: tx.manager?.name || "Unknown",
    status: tx.status === "REVERSED" ? "Reversed" : "Confirmed",
    auditLogs: tx.auditLogs || []
  })) || [];

  const agents = useMemo(() => {
    const sortedAgentsList = [...agentsList].sort((a: any, b: any) => {
      const aToday = a.salesToday || 0;
      const bToday = b.salesToday || 0;
      if (bToday !== aToday) return bToday - aToday;
      
      const aWeek = a.salesWeek || 0;
      const bWeek = b.salesWeek || 0;
      return bWeek - aWeek;
    });

    return sortedAgentsList.map((agent: any, index: number) => {
      const rawTrend = agent.trend || [0, 0, 0, 0, 0, 0, 0];
      const trend = rawTrend.map((sales: number, i: number) => {
        const d = date ? new Date(date) : new Date();
        d.setDate(d.getDate() - (6 - i));
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return {
          sales,
          label: days[d.getDay()]
        };
      });

      return {
        id: agent.id,
        name: agent.name,
        initials: agent.name ? agent.name.substring(0, 2).toUpperCase() : "A",
        avatarUrl: agent.avatarUrl || null,
        rank: index + 1,
        today: agent.salesToday || 0,
        week: agent.salesWeek || 0,
        trend,
      };
    });
  }, [agentsList, date]);
  
  const isComponentLoading = isLoadingProp || queryLoading;

  const isPastDate = (() => {
    if (!date) return false;
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    return date < todayStr;
  })();

  const handleOpenAddSale = (agent: any) => {
    setSelectedAgent(agent);
    setSaleCount(1);
    setIsAdding(false);
  };

  const handleConfirmAddSale = async () => {
    if (!selectedAgent) return;
    setIsAdding(true);
    try {
      // If a specific date is being viewed in the dashboard, force the sale into that date's bucket
      // by sending a midnight UTC string, which the backend will use directly as the bucket Date.
      // Otherwise, use current ISO string for dynamic bucketing based on office hours.
      const dateToSubmit = date ? `${date}T00:00:00.000Z` : new Date().toISOString();
      
      await addDailySales({
        agentId: selectedAgent.id,
        date: dateToSubmit,
        salesCount: saleCount
      }).unwrap();
      
      toast.success(`${saleCount} sale(s) added successfully for ${selectedAgent.name}`);
      setSelectedAgent(null);
    } catch (error) {
      toast.error("Failed to add sale");
    } finally {
      setIsAdding(false);
    }
  };

  const handleConfirmReverse = async () => {
    if (!reverseSale || !correctAgent) return;
    setIsProcessing(true);
    try {
      await reverseSaleMutation(reverseSale.id).unwrap();
      toast.success(`Sale reversed for ${correctAgent.name}`);
      setReverseSale(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reverse sale");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmEdit = async () => {
    if (!editSale || !correctAgent) return;
    setIsProcessing(true);
    try {
      await editSaleMutation({ auditId: editSale.id, newCount: editCount }).unwrap();
      toast.success(`Sale count updated for ${correctAgent.name}`);
      setEditSale(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to edit sale");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    state: {
      isComponentLoading,
      isPastDate,
      selectedAgent,
      saleCount,
      isAdding,
      correctAgent,
      expandedTx,
      reverseSale,
      editSale,
      editCount,
      isProcessing,
      auditLoading
    },
    data: {
      agents,
      transactions
    },
    actions: {
      setSelectedAgent,
      setSaleCount,
      setCorrectAgent,
      setExpandedTx,
      setReverseSale,
      setEditSale,
      setEditCount,
      handleOpenAddSale,
      handleConfirmAddSale,
      handleConfirmReverse,
      handleConfirmEdit
    }
  };
}
