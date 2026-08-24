import { useState } from "react";
import { toast } from "sonner";
import { X, Loader2, AlertCircle } from "lucide-react";

import { 
  useGetAgentsQuery, 
  useAddDailySalesMutation,
  useGetAgentTodayAuditQuery,
  useReverseSaleMutation,
  useEditSaleMutation
} from "@/redux/api/agent.api";

interface AgentsTableProps {
  isLoading?: boolean; // We'll ignore the prop and use the query's isLoading
  date?: string;
}

export function AgentsTable({ isLoading, date }: AgentsTableProps) {
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

  const agents = agentsList.map((agent: any) => ({
    id: agent.id,
    name: agent.name,
    initials: agent.name ? agent.name.substring(0, 2).toUpperCase() : "A",
    today: agent.salesToday || 0,
    week: agent.salesWeek || 0,
    trend: agent.trend || [0, 0, 0, 0, 0, 0, 0],
  }));
  
  const isComponentLoading = isLoading || queryLoading;

  const handleOpenAddSale = (agent: any) => {
    setSelectedAgent(agent);
    setSaleCount(1);
    setIsAdding(false);
  };

  const handleConfirmAddSale = async () => {
    if (!selectedAgent) return;
    setIsAdding(true);
    try {
      const todayIso = new Date().toISOString();
      
      await addDailySales({
        agentId: selectedAgent.id,
        date: todayIso,
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

  return (
    <>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden p-2 md:p-0">
        
        {/* Mobile View: Cards */}
        <div className="flex flex-col xl:hidden divide-y divide-zinc-100">
          {isComponentLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200"></div>
                  <div className="w-24 h-4 bg-zinc-200 rounded"></div>
                </div>
                <div className="flex justify-between mb-3">
                  <div>
                    <div className="w-12 h-3 bg-zinc-200 rounded mb-1"></div>
                    <div className="w-8 h-4 bg-zinc-200 rounded"></div>
                  </div>
                  <div>
                    <div className="w-12 h-3 bg-zinc-200 rounded mb-1"></div>
                    <div className="w-8 h-4 bg-zinc-200 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 h-10 bg-zinc-200 rounded-lg"></div>
                  <div className="flex-1 h-10 bg-zinc-200 rounded-lg"></div>
                </div>
              </div>
            ))
          ) : agents.map((agent: any) => (
            <div key={agent.id} className="p-4 hover:bg-zinc-50/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                    {agent.initials}
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-900 block">{agent.name}</span>
                    <span className="text-[11px] text-zinc-500 font-medium">Rank #1</span>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {agent.trend.map((h: number, i: number) => (
                    <div key={i} className="w-1.5 bg-[#9494ff] rounded-full" style={{ height: h === 0 ? '20%' : `${Math.min(100, 20 + (h * 20))}%` }}></div>
                  ))}
                </div>
              </div>
              
              <div className="flex bg-zinc-50 rounded-xl p-3 mb-4">
                <div className="flex-1 text-center border-r border-zinc-200">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Today</p>
                  <p className="text-xl font-bold text-zinc-900">{agent.today}</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Week</p>
                  <p className="text-xl font-bold text-zinc-500">{agent.week}</p>
                </div>
              </div>

              <div className="flex sm:justify-end items-center gap-2">
                <button 
                  onClick={() => handleOpenAddSale(agent)}
                  className="flex-1 sm:flex-none sm:w-28 bg-[#5252ff] cursor-pointer hover:bg-[#4242e5] text-white px-4 py-3 sm:py-2 rounded-[6px] text-sm sm:text-[13px] font-semibold transition-colors shadow-sm"
                >
                  + Add Sale
                </button>
                <button 
                  onClick={() => setCorrectAgent(agent)}
                  className="flex-1 sm:flex-none sm:w-24 bg-[#eef0ff] cursor-pointer hover:bg-[#e0e4ff] text-[#5252ff] px-4 py-3 sm:py-2 rounded-[6px] text-sm sm:text-[13px] font-semibold transition-colors"
                >
                  Correct
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden xl:block overflow-x-auto p-2">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-bold text-zinc-400 uppercase">
            <tr>
              <th className="px-4 py-3 tracking-wider font-semibold">AGENT</th>
              <th className="px-4 py-3 tracking-wider font-semibold text-center">TODAY</th>
              <th className="px-4 py-3 tracking-wider font-semibold text-center">WEEK</th>
              <th className="px-4 py-3 tracking-wider font-semibold text-center">7-DAY TREND</th>
              <th className="px-4 py-3 tracking-wider font-semibold text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isComponentLoading ? (
              // Skeleton Rows
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-200"></div>
                      <div className="w-24 h-4 bg-zinc-200 rounded"></div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="w-8 h-4 mx-auto bg-zinc-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="w-8 h-4 mx-auto bg-zinc-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="w-16 h-4 mx-auto bg-zinc-200 rounded"></div></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-6 bg-zinc-200 rounded-lg"></div>
                      <div className="w-12 h-6 bg-zinc-200 rounded-lg"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : agents.map((agent: any) => (
              <tr key={agent.id} className="hover:bg-zinc-50/80 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {agent.initials}
                    </div>
                    <span className="font-semibold text-zinc-900">{agent.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-bold text-zinc-900">{agent.today}</td>
                <td className="px-4 py-3 text-center text-zinc-500">{agent.week}</td>
                <td className="px-4 py-3">
                  <div className="flex items-end justify-center gap-1.5 h-8">
                    {/* Real Trend Bars */}
                    {agent.trend.map((h: number, i: number) => (
                      <div key={i} className="w-2.5 bg-[#9494ff] rounded-full" style={{ height: h === 0 ? '20%' : `${Math.min(100, 20 + (h * 20))}%` }}></div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleOpenAddSale(agent)}
                      className="bg-[#5252ff] cursor-pointer hover:bg-[#4242e5] text-white px-4 py-3 rounded-md text-xs font-semibold transition-colors"
                    >
                      + Add Sale
                    </button>
                    <button 
                      onClick={() => setCorrectAgent(agent)}
                      className="bg-[#eef0ff] cursor-pointer hover:bg-[#e0e4ff] text-[#5252ff] px-4 py-3 rounded-md text-xs font-semibold transition-colors"
                    >
                      Correct
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Add Sale Modal Overlay */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="font-bold   text-zinc-900 text-base">
                Add Sale — {selectedAgent.name}
              </h3>
              <button onClick={() => !isAdding && setSelectedAgent(null)} disabled={isAdding} className="text-zinc-400 cursor-pointer hover:text-zinc-600 transition-colors disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                  <button onClick={() => setSaleCount(Math.max(1, saleCount - 1))} disabled={isAdding} className="w-10 cursor-pointer h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors font-bold text-lg disabled:opacity-50">-</button>
                  <div className="w-12 h-10 flex items-center justify-center bg-white border-x border-zinc-200 font-bold text-zinc-900">{saleCount}</div>
                  <button onClick={() => setSaleCount(saleCount + 1)} disabled={isAdding} className="w-10 cursor-pointerh-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors font-bold text-lg disabled:opacity-50">+</button>
                </div>
                <span className="text-sm font-medium text-zinc-600">sale(s)</span>
              </div>
              
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                Will be recorded under {selectedAgent.name} at the current time.
              </p>
              
              <div className="flex items-center gap-3">
                <button onClick={handleConfirmAddSale} disabled={isAdding} className="flex-1 cursor-pointer flex justify-center items-center gap-2 bg-[#5252ff] hover:bg-[#4242e5] disabled:bg-[#5252ff]/70 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm">
                  {isAdding ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : "Confirm"}
                </button>
                <button onClick={() => setSelectedAgent(null)} disabled={isAdding} className="flex-1 cursor-pointer bg-white border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white text-zinc-700 font-semibold py-2.5 rounded-lg transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Correction Sidebar Overlay */}
      {correctAgent && (
        <div className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-sm" onClick={() => { setCorrectAgent(null); setExpandedTx(null); }} />
      )}

      {/* Correction Sidebar Panel */}
      <div className={`fixed inset-y-0 right-0 z-[1000] w-full sm:w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${correctAgent ? 'translate-x-0' : 'translate-x-full'}`}>
        {correctAgent && (
          <>
            <div className="pt-6 sm:pt-8 px-5 sm:px-8 pb-4 sm:pb-6 relative">
              <button 
                onClick={() => setCorrectAgent(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-zinc-400 hover:text-zinc-600 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4 mb-2 pr-10">
                <div className="w-10 h-10 rounded-full bg-[#f0f4ff] text-[#5252ff] flex items-center justify-center font-bold text-sm shrink-0">
                  {correctAgent.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-zinc-900 text-[17px] sm:text-lg tracking-tight truncate">
                    {correctAgent.name} — Today's Sales
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 truncate">
                    {transactions.length} transactions today • {correctAgent.today} total sales
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-8 pb-4">
              <div className="w-full h-px bg-zinc-100"></div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-8">
              <div className="space-y-6">
                {auditLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#5252ff]" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center p-8 text-zinc-500 text-sm">
                    No transactions found for today.
                  </div>
                ) : transactions.map((tx: any, idx: number) => (
                  <div key={tx.id} className="relative">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-semibold text-sm mb-1 ${tx.status === "Reversed" ? "text-zinc-400" : "text-zinc-900"}`}>
                          {tx.count} {tx.count === 1 ? 'sale' : 'sales'} at {tx.time}
                        </p>
                        <p className={`text-[13px] ${tx.status === "Reversed" ? "text-zinc-400" : "text-zinc-500"}`}>
                          Entered by {tx.by}
                        </p>
                      </div>
                      
                      {tx.status === "Reversed" ? (
                        <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                          Reversed
                        </span>
                      ) : (
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => { setEditSale(tx); setEditCount(tx.count); }}
                            className="text-[#5252ff] cursor-pointer hover:text-[#4242e5] font-medium text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => setReverseSale(tx)}
                            className="bg-[#e11d48] hover:bg-[#be123c] cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Reverse
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Collapsible History Dropdown */}
                    {tx.auditLogs && tx.auditLogs.length > 0 && (
                      <div className="mt-3">
                        <button
                          onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                          className="text-xs font-medium text-zinc-500 hover:text-zinc-700 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {expandedTx === tx.id ? "Hide History" : "View History"}
                          <svg className={`w-3 h-3 transition-transform ${expandedTx === tx.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {expandedTx === tx.id && (
                          <div className="mt-2 pl-3 border-l-2 border-zinc-200 space-y-3">
                            {tx.auditLogs.map((log: any) => (
                              <div key={log.id} className="text-[13px]">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`font-semibold ${log.action === 'ADDED' ? 'text-green-600' : log.isReversed ? 'text-red-600' : 'text-blue-600'}`}>
                                    {log.action === 'ADDED' ? 'Added' : log.isReversed ? 'Reversed' : 'Edited'}
                                  </span>
                                  <span className="text-zinc-400 text-xs">• {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="text-zinc-600">
                                  {log.action === 'ADDED' ? (
                                    <>Original count: <b>{log.newAmount}</b></>
                                  ) : log.isReversed ? (
                                    <>Count was <b>{log.previousAmount}</b> before reversal</>
                                  ) : (
                                    <>Changed from <b>{log.previousAmount}</b> to <b>{log.newAmount}</b></>
                                  )}
                                </div>
                                <div className="text-zinc-400 text-xs mt-0.5">by {log.manager?.name || "Unknown"}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Add border bottom except for last item */}
                    {idx < transactions.length - 1 && (
                      <div className="w-full h-px bg-zinc-100 mt-6"></div>
                    )}
                  </div>
                ))}

                {/* Close Button at bottom of list */}
                <div className="p-5 sm:p-8 border-t border-zinc-100 mt-4 shrink-0">
                  <button 
                    onClick={() => { setCorrectAgent(null); setExpandedTx(null); }}
                    className="w-full py-3 bg-[#eef0ff] hover:bg-[#e0e4ff] text-[#5252ff] font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reverse Sale Modal */}
      {reverseSale && correctAgent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-900 text-lg mb-4">Reverse this sale?</h3>
              
              <div className="w-full bg-zinc-50 rounded-lg p-3 text-left mb-4 border border-zinc-100">
                <p className="font-semibold text-zinc-800 text-sm">
                  {reverseSale.count} {reverseSale.count === 1 ? 'sale' : 'sales'} • {correctAgent.name} • {reverseSale.time}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Originally entered by {reverseSale.by}</p>
              </div>

              <p className="text-sm text-zinc-500 leading-relaxed mb-6 text-left w-full">
                This will remove the sale from {correctAgent.name}'s daily and weekly totals and update the leaderboard immediately. The TV board will not replay the BOOM animation.
              </p>

              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={handleConfirmReverse}
                  disabled={isProcessing}
                  className="flex-1 flex justify-center items-center gap-2 bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-[#ef4444]/70 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm"
                >
                  {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Reversing...</> : "Yes, Reverse Sale"}
                </button>
                <button 
                  onClick={() => !isProcessing && setReverseSale(null)}
                  disabled={isProcessing}
                  className="flex-none px-6 bg-white hover:bg-zinc-50 text-zinc-600 font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sale Count Modal */}
      {editSale && correctAgent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[420px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100">
              <h3 className="font-bold text-zinc-900 text-base">Edit Sale Count</h3>
              <p className="text-xs text-zinc-500 mt-1">
                {correctAgent.name} • originally entered at {editSale.time} by {editSale.by}
              </p>
            </div>
            
            <div className="px-6 py-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                  <button 
                    onClick={() => setEditCount(Math.max(1, editCount - 1))}
                    disabled={isProcessing}
                    className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors font-bold text-lg disabled:opacity-50"
                  >
                    -
                  </button>
                  <div className="w-12 h-10 flex items-center justify-center bg-white border-x border-zinc-200 font-bold text-zinc-900">
                    {editCount}
                  </div>
                  <button 
                    onClick={() => setEditCount(editCount + 1)}
                    disabled={isProcessing}
                    className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors font-bold text-lg disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm font-medium text-zinc-600">sale(s) (was {editSale.count})</span>
              </div>
              
              {editCount !== editSale.count && (
                <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-100 mb-6 leading-relaxed">
                  This {editCount > editSale.count ? 'adds' : 'removes'} {Math.abs(editCount - editSale.count)} sale{Math.abs(editCount - editSale.count) > 1 ? 's' : ''} from {correctAgent.name}'s daily and weekly totals. The leaderboard updates immediately; no BOOM replays.
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleConfirmEdit}
                  disabled={isProcessing || editCount === editSale.count}
                  className="flex-1 flex justify-center items-center gap-2 bg-[#5252ff] hover:bg-[#4242e5] disabled:bg-[#5252ff]/50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm"
                >
                  {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Change"}
                </button>
                <button 
                  onClick={() => !isProcessing && setEditSale(null)}
                  disabled={isProcessing}
                  className="flex-none px-6 bg-white hover:bg-zinc-50 text-zinc-600 font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
