import { useState, useRef, useEffect } from "react";
import { AddAgentModal } from "../modals/AddAgentModal";
import { EditAgentModal } from "../modals/EditAgentModal";
import { useUpdateAgentMutation, useDeleteAgentMutation } from "@/redux/api/agent.api";
import { MoreVertical, Trash2, Ban, UserCheck } from "lucide-react";

interface AgentListTableProps {
  agents?: any[];
  isLoading?: boolean;
}

export function AgentListTable({ agents, isLoading }: AgentListTableProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [selectedEditAgent, setSelectedEditAgent] = useState<any>(null);

  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<any>(null);
  const [agentToToggle, setAgentToToggle] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [updateAgent, { isLoading: isUpdatingStatus }] = useUpdateAgentMutation();
  const [deleteAgent, { isLoading: isDeleting }] = useDeleteAgentMutation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirmToggle = async () => {
    if (!agentToToggle) return;
    const newStatus = !agentToToggle.isActive;
    try {
      await updateAgent({ id: agentToToggle.id, isActive: newStatus }).unwrap();
      setAgentToToggle(null);
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update agent status");
    }
  };

  const handleConfirmDelete = async () => {
    if (!agentToDelete) return;
    try {
      await deleteAgent(agentToDelete.id).unwrap();
      setAgentToDelete(null);
    } catch (err) {
      console.error("Failed to delete agent", err);
      alert("Failed to delete agent");
    }
  };

  return (
    <div className="flex flex-col gap-6  mx-auto">
      {/* Table Header Section (outside the white card) */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">All agents list</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#5252ff] cursor-pointer hover:bg-[#4242e5] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          + Add Agent
        </button>
      </div>

      {/* Table Container (white card) */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        
        {/* Mobile View: Cards */}
        <div className="flex flex-col xl:hidden divide-y divide-zinc-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-mob-${i}`} className="p-4 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 shrink-0"></div>
                  <div className="w-32 h-4 bg-zinc-100 rounded"></div>
                </div>
                <div className="flex justify-between mb-4">
                  <div className="w-16 h-6 bg-zinc-100 rounded-full"></div>
                  <div className="w-24 h-4 bg-zinc-100 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-zinc-100 rounded-[6px]"></div>
                  <div className="flex-[1.5] h-10 bg-zinc-100 rounded-[6px]"></div>
                </div>
              </div>
            ))
          ) : agents && agents.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-medium">
              No agents available
            </div>
          ) : (
            (agents || []).map((agent) => {
              const initials = agent.name ? agent.name.substring(0, 2).toUpperCase() : "A";
              const statusText = agent.isActive ? "Active" : "Inactive";
              return (
              <div key={`mob-${agent.id}`} className="p-4 hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f0f4ff] text-[#5252ff] flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                      {initials}
                    </div>
                    <span className="font-semibold text-zinc-900 text-[15px]">{agent.name}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                    agent.isActive
                      ? "bg-[#e5fcf1] text-[#1f9d55]" 
                      : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {statusText}
                  </span>
                </div>
                
                <div className="flex bg-zinc-50 rounded-xl p-3 mb-4">
                  <div className="flex-1 text-center border-r border-zinc-200">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Today</p>
                    <p className="text-xl font-bold text-zinc-900">{agent.salesToday || 0}</p>
                  </div>
                  <div className="flex-1 text-center border-r border-zinc-200">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Week</p>
                    <p className="text-xl font-bold text-zinc-500">{agent.salesWeek || 0}</p>
                  </div>
                  <div className="flex-1 text-center flex flex-col items-center justify-center px-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Goal</p>
                    <p className="text-[11px] font-medium text-zinc-600 leading-tight">{agent.dailyGoal || 0} /day</p>
                  </div>
                </div>

                <div className="flex sm:justify-end items-center gap-2">
                  <button 
                    onClick={() => setSelectedEditAgent(agent)}
                    className="flex-1 sm:flex-none sm:w-20 px-4 py-2.5 sm:py-2 cursor-pointer flex items-center justify-center bg-[#f0f4ff] hover:bg-[#e0e7ff] text-[#5252ff] rounded-[6px] text-xs sm:text-[13px] font-semibold transition-colors"
                  >
                    Edit
                  </button>
                  {agent.isActive ? (
                    <button 
                      onClick={() => setAgentToToggle(agent)}
                      className="flex-[1.5] sm:flex-none sm:w-28 px-4 py-2.5 sm:py-2 cursor-pointer flex items-center justify-center bg-[#e11d48] hover:bg-[#be123c] text-white rounded-[6px] text-xs sm:text-[13px] font-semibold transition-colors shadow-sm">
                      Deactivate
                    </button>
                  ) : (
                    <button 
                      onClick={() => setAgentToToggle(agent)}
                      className="flex-[1.5] sm:flex-none sm:w-28 px-4 py-2.5 sm:py-2 cursor-pointer flex items-center justify-center border border-zinc-200 bg-white hover:bg-zinc-50 text-[#5252ff] rounded-[6px] text-xs sm:text-[13px] font-semibold transition-colors shadow-sm">
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            )})
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full text-left">
          <thead className="text-[11px] font-bold text-zinc-400 uppercase bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4 tracking-wider">AGENT</th>
              <th className="px-6 py-4 tracking-wider text-center">STATUS</th>
              <th className="px-6 py-4 tracking-wider text-center">INDIVIDUAL GOAL</th>
              <th className="px-6 py-4 tracking-wider text-center">TODAY</th>
              <th className="px-6 py-4 tracking-wider text-center">WEEK</th>
              <th className="px-6 py-4 tracking-wider text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 shrink-0"></div>
                      <div className="w-32 h-4 bg-zinc-100 rounded"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-16 h-6 bg-zinc-100 rounded-full mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-24 h-4 bg-zinc-100 rounded mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-6 h-4 bg-zinc-100 rounded mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-8 h-4 bg-zinc-100 rounded mx-auto"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-[50px] h-[28px] bg-zinc-100 rounded-[6px]"></div>
                      <div className="w-[74px] h-[28px] bg-zinc-100 rounded-[6px]"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : agents && agents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">
                  No agents available
                </td>
              </tr>
            ) : (
            (agents || []).map((agent) => {
              const initials = agent.name ? agent.name.substring(0, 2).toUpperCase() : "A";
              const statusText = agent.isActive ? "Active" : "Inactive";
              return (
                <tr key={agent.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-[#f0f4ff] text-[#5252ff] flex items-center justify-center font-bold text-sm shrink-0">
                        {initials}
                      </div>
                      <span className="font-semibold text-zinc-900 text-[15px]">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                      agent.isActive 
                        ? "bg-[#e5fcf1] text-[#1f9d55]" 
                        : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {statusText}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-500 font-medium">
                    {agent.dailyGoal || 0} /day
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-zinc-900 text-[15px]">
                    {agent.salesToday || 0}
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-500 font-medium">
                    {agent.salesWeek || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => setSelectedEditAgent(agent)}
                        className="px-4 py-3 flex cursor-pointer items-center justify-center bg-[#f0f4ff] hover:bg-[#e0e7ff] text-[#5252ff] rounded-[6px] text-xs font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      {agent.isActive ? (
                        <button 
                          onClick={() => setAgentToToggle(agent)}
                          className="px-4 py-3 cursor-pointer flex items-center justify-center bg-[#e11d48] hover:bg-[#be123c] text-white rounded-[6px] text-xs font-semibold transition-colors">
                          Deactivate
                        </button>
                      ) : (
                        <button 
                          onClick={() => setAgentToToggle(agent)}
                          className="px-4 py-3 cursor-pointer flex items-center justify-center bg-white hover:bg-zinc-50 text-[#5252ff] rounded-[6px] text-xs font-semibold transition-colors">
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
        </div>
      </div>

      <EditAgentModal isOpen={!!selectedEditAgent} onClose={() => setSelectedEditAgent(null)} agent={selectedEditAgent} />

      {agentToDelete && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[400px] shadow-2xl p-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#fff0f0] rounded-full flex items-center justify-center mb-5">
              <Trash2 className="w-7 h-7 text-[#ff1f1f]" />
            </div>
            
            <h2 className="text-2xl font-bold text-zinc-900 mb-3">Delete User?</h2>
            
            <p className="text-center text-zinc-500 text-base mb-8 leading-relaxed px-4">
              Are you sure you want to delete <span className="font-bold text-zinc-700">{agentToDelete.name}</span>? This action cannot be undone.
            </p>

            <div className="flex w-full gap-4">
              <button 
                onClick={() => setAgentToDelete(null)}
                className="flex-1 px-6 py-3 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-zinc-700 text-sm font-bold rounded-xl transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-[#e10e19] hover:bg-[#c90a14] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {agentToToggle && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[400px] shadow-2xl p-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${
              agentToToggle.isActive ? "bg-[#fff0f0]" : "bg-[#e5fcf1]"
            }`}>
              {agentToToggle.isActive ? (
                <Ban className="w-7 h-7 text-[#ff1f1f]" />
              ) : (
                <UserCheck className="w-7 h-7 text-[#1f9d55]" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-zinc-900 mb-3">
              {agentToToggle.isActive ? "Deactivate User?" : "Reactivate User?"}
            </h2>
            
            <p className="text-center text-zinc-500 text-base mb-8 leading-relaxed px-4">
              Are you sure you want to {agentToToggle.isActive ? "deactivate" : "reactivate"} <span className="font-bold text-zinc-700">{agentToToggle.name}</span>?
              {agentToToggle.isActive && " They will temporarily lose access to their portal."}
            </p>

            <div className="flex w-full gap-4">
              <button 
                onClick={() => setAgentToToggle(null)}
                className="flex-1 px-6 py-3 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-zinc-700 text-sm font-bold rounded-xl transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmToggle}
                disabled={isUpdatingStatus}
                className={`flex-1 px-6 py-3 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap ${
                  agentToToggle.isActive 
                    ? "bg-[#e10e19] hover:bg-[#c90a14]" 
                    : "bg-[#1f9d55] hover:bg-[#188044]"
                }`}
              >
                {isUpdatingStatus ? "Updating..." : `Yes, ${agentToToggle.isActive ? "Deactivate" : "Reactivate"}`}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AddAgentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
