import { useState } from "react";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";

interface ManagedAgentsTableProps {
  agents: any[];
  router: any;
  handleToggleStatus: (id: number, isActive: boolean) => void;
  handleDeleteAgent: (id: number) => void;
}

export function ManagedAgentsTable({ agents, router, handleToggleStatus, handleDeleteAgent }: ManagedAgentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil((agents?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgents = (agents || []).slice(startIndex, endIndex);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="bg-zinc-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            {toastMessage}
          </div>
        </div>
      )}
      <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Users className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-zinc-900">Managed Agents ({agents?.length || 0})</h3>
      </div>
    
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50/50">
            <tr>
              <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Agent Name</th>
              <th className="px-4 py-4 tracking-wider border-b border-zinc-100 text-center">Status</th>
              <th className="px-4 py-4 tracking-wider border-b border-zinc-100 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {!agents || agents.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                  No agents currently managed.
                </td>
              </tr>
            ) : (
              paginatedAgents.map((agent: any) => (
                <tr key={agent.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-zinc-900">{agent.name}</p>
                    <p className="text-xs text-zinc-500">{agent.email}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${agent.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => router.push(`/dashboard/manager-management/${agent.id}`)}
                        className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => showToast("Coming soon")}
                        className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${agent.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                      >
                        {agent.isActive ? 'Block' : 'Unblock'}
                      </button>
                      <button 
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {agents && agents.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-white">
          <span className="text-sm text-zinc-500">
            Showing <span className="font-medium text-zinc-900">{startIndex + 1}</span> to <span className="font-medium text-zinc-900">{Math.min(endIndex, agents.length)}</span> of <span className="font-medium text-zinc-900">{agents.length}</span> entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                }
                if (pageNum === null) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum as number)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 text-white border border-blue-600' 
                        : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
