import { useState, useRef, useLayoutEffect } from "react";
import { useAgentsTable } from "../hooks/useAgentsTable";
import { AddSaleModal } from "../modals/AddSaleModal";
import { ReverseSaleModal } from "../modals/ReverseSaleModal";
import { EditSaleModal } from "../modals/EditSaleModal";
import { CorrectionSidebar } from "../ui/CorrectionSidebar";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

interface AgentsTableProps {
  isLoading?: boolean;
  date?: string;
}

export function AgentsTable({ isLoading, date }: AgentsTableProps) {
  const { state, data, actions } = useAgentsTable(isLoading, date);

  const desktopContainerRef = useRef<HTMLTableSectionElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const [layoutAgents, setLayoutAgents] = useState(data.agents);
  const prevDataStr = useRef(JSON.stringify(data.agents));

  useLayoutEffect(() => {
    const currentDataStr = JSON.stringify(data.agents);
    if (prevDataStr.current !== currentDataStr) {
      let stateDesktop = null;
      let stateMobile = null;
      
      if (typeof window !== "undefined") {
        if (desktopContainerRef.current) {
          stateDesktop = Flip.getState(gsap.utils.toArray('.desktop-agent-row', desktopContainerRef.current));
        }
        if (mobileContainerRef.current) {
          stateMobile = Flip.getState(gsap.utils.toArray('.mobile-agent-card', mobileContainerRef.current));
        }
      }

      setLayoutAgents(data.agents);
      prevDataStr.current = currentDataStr;

      requestAnimationFrame(() => {
        if (stateDesktop && desktopContainerRef.current) {
          Flip.from(stateDesktop, { duration: 0.6, ease: "power2.inOut", scale: true, zIndex: 10 });
        }
        if (stateMobile && mobileContainerRef.current) {
          Flip.from(stateMobile, { duration: 0.6, ease: "power2.inOut", scale: true, zIndex: 10 });
        }
      });
    }
  }, [data.agents]);

  return (
    <>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden p-2 md:p-0">
        
        {/* Mobile View: Cards */}
        <div ref={mobileContainerRef} className="flex flex-col xl:hidden divide-y divide-zinc-100 relative">
          {state.isComponentLoading ? (
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
          ) : data.agents.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <p className="text-sm font-medium">Not available</p>
            </div>
          ) : layoutAgents.map((agent: any) => (
            <div key={agent.id} data-flip-id={`mobile-${agent.id}`} className="mobile-agent-card p-4 bg-white z-10 w-full hover:bg-zinc-50/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {agent.avatarUrl ? (
                    <img src={agent.avatarUrl} alt={agent.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                      {agent.initials}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-zinc-900 block">{agent.name}</span>
                    <span className="text-[11px] text-zinc-500 font-medium">Rank #{agent.rank}</span>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-8">
                  {agent.trend.map((t: any, i: number) => (
                    <div key={i} className="group/trend relative flex items-end h-full">
                      <div 
                        className="w-1.5 bg-[#9494ff] rounded-full transition-all" 
                        style={{ height: t.sales === 0 ? '20%' : `${Math.min(100, 20 + (t.sales * 20))}%` }}
                      ></div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/trend:block z-50">
                        <div className="bg-zinc-800 text-white text-[10px] rounded py-1 px-2 whitespace-nowrap shadow-xl border border-zinc-700">
                          <span className="font-bold">{t.label}</span>: {t.sales} sale{t.sales !== 1 ? 's' : ''}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800"></div>
                      </div>
                    </div>
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
                  onClick={() => actions.handleOpenAddSale(agent)}
                  disabled={state.isPastDate}
                  className={`flex-1 sm:flex-none sm:w-28 px-4 py-3 sm:py-2 rounded-[6px] text-sm sm:text-[13px] font-semibold transition-colors shadow-sm ${state.isPastDate ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none' : 'bg-[#5252ff] cursor-pointer hover:bg-[#4242e5] text-white'}`}
                >
                  + Add Sale
                </button>
                <button 
                  onClick={() => actions.setCorrectAgent(agent)}
                  className={`flex-1 sm:flex-none sm:w-24 px-4 py-3 sm:py-2 rounded-[6px] text-sm sm:text-[13px] font-semibold transition-colors ${state.isPastDate ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 cursor-pointer' : 'bg-[#eef0ff] cursor-pointer hover:bg-[#e0e4ff] text-[#5252ff]'}`}
                >
                  {state.isPastDate ? 'View Log' : 'Correct'}
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
          <tbody ref={desktopContainerRef} className="divide-y divide-zinc-100 relative">
            {state.isComponentLoading ? (
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
            ) : data.agents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-zinc-500">
                  <p className="text-sm font-medium">Not available</p>
                </td>
              </tr>
            ) : layoutAgents.map((agent: any) => (
              <tr key={agent.id} data-flip-id={`desktop-${agent.id}`} className="desktop-agent-row hover:bg-zinc-50/80 bg-white transition-colors group z-10">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {agent.avatarUrl ? (
                      <img src={agent.avatarUrl} alt={agent.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {agent.initials}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-zinc-900 block">{agent.name}</span>
                      <span className="text-[10px] text-zinc-500 font-medium block">Rank #{agent.rank}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-bold text-zinc-900">{agent.today}</td>
                <td className="px-4 py-3 text-center text-zinc-500">{agent.week}</td>
                <td className="px-4 py-3">
                  <div className="flex items-end justify-center gap-1.5 h-8">
                    {agent.trend.map((t: any, i: number) => (
                      <div key={i} className="group/trend relative flex items-end h-full">
                        <div 
                          className="w-2.5 bg-[#9494ff] hover:bg-[#7272ff] rounded-full transition-colors cursor-pointer" 
                          style={{ height: t.sales === 0 ? '20%' : `${Math.min(100, 20 + (t.sales * 20))}%` }}
                        ></div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/trend:block z-50">
                          <div className="bg-zinc-800 text-white text-[10px] rounded py-1 px-2 whitespace-nowrap shadow-xl border border-zinc-700">
                            <span className="font-bold text-indigo-200">{t.label}</span>: {t.sales} sale{t.sales !== 1 ? 's' : ''}
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-zinc-800"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => actions.handleOpenAddSale(agent)}
                      disabled={state.isPastDate}
                      className={`px-4 py-3 rounded-md text-xs font-semibold transition-colors ${state.isPastDate ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-[#5252ff] cursor-pointer hover:bg-[#4242e5] text-white'}`}
                    >
                      + Add Sale
                    </button>
                    <button 
                      onClick={() => actions.setCorrectAgent(agent)}
                      className={`px-4 py-3 rounded-md text-xs font-semibold transition-colors ${state.isPastDate ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 cursor-pointer' : 'bg-[#eef0ff] cursor-pointer hover:bg-[#e0e4ff] text-[#5252ff]'}`}
                    >
                      {state.isPastDate ? 'View Log' : 'Correct'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <AddSaleModal 
        selectedAgent={state.selectedAgent}
        saleCount={state.saleCount}
        isAdding={state.isAdding}
        setSaleCount={actions.setSaleCount}
        onConfirm={actions.handleConfirmAddSale}
        onClose={() => actions.setSelectedAgent(null)}
      />

      <CorrectionSidebar 
        correctAgent={state.correctAgent}
        transactions={data.transactions}
        auditLoading={state.auditLoading}
        isPastDate={state.isPastDate}
        expandedTx={state.expandedTx}
        setExpandedTx={actions.setExpandedTx}
        setEditSale={actions.setEditSale}
        setEditCount={actions.setEditCount}
        setReverseSale={actions.setReverseSale}
        onClose={() => actions.setCorrectAgent(null)}
      />

      <ReverseSaleModal 
        reverseSale={state.reverseSale}
        correctAgent={state.correctAgent}
        isProcessing={state.isProcessing}
        onConfirm={actions.handleConfirmReverse}
        onClose={() => actions.setReverseSale(null)}
      />

      <EditSaleModal 
        editSale={state.editSale}
        correctAgent={state.correctAgent}
        editCount={state.editCount}
        isProcessing={state.isProcessing}
        setEditCount={actions.setEditCount}
        onConfirm={actions.handleConfirmEdit}
        onClose={() => actions.setEditSale(null)}
      />
    </>
  );
}
