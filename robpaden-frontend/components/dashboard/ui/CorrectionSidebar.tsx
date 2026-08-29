import { X, Loader2 } from "lucide-react";

interface CorrectionSidebarProps {
  correctAgent: { id: number; name: string; initials: string; today: number } | null;
  transactions: any[];
  auditLoading: boolean;
  isPastDate: boolean;
  expandedTx: number | null;
  setExpandedTx: (id: number | null) => void;
  setEditSale: (tx: any) => void;
  setEditCount: (count: number) => void;
  setReverseSale: (tx: any) => void;
  onClose: () => void;
}

export function CorrectionSidebar({
  correctAgent,
  transactions,
  auditLoading,
  isPastDate,
  expandedTx,
  setExpandedTx,
  setEditSale,
  setEditCount,
  setReverseSale,
  onClose,
}: CorrectionSidebarProps) {
  if (!correctAgent) return null;

  return (
    <>
      {/* Correction Sidebar Overlay */}
      <div 
        className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Correction Sidebar Panel */}
      <div className={`fixed inset-y-0 right-0 z-[1000] w-full sm:w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col`}>
        <div className="pt-6 sm:pt-8 px-5 sm:px-8 pb-4 sm:pb-6 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-zinc-400 hover:text-zinc-600 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
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

        <div className="px-5 sm:px-8 pb-4 shrink-0">
          <div className="w-full h-px bg-zinc-100"></div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-8 pb-4">
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
                  ) : isPastDate ? (
                    <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-xs font-medium rounded-full">
                      Completed
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
                onClick={onClose}
                className="w-full py-3 bg-[#eef0ff] hover:bg-[#e0e4ff] text-[#5252ff] font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
