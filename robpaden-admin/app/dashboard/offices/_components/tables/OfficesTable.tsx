import React from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Office } from "@/redux/api/office.api";
import { formatAMPM } from "../../_hooks/useOffices";

interface OfficesTableProps {
  offices: Office[];
  isLoading: boolean;
  isFetching: boolean;
  isDeleting: boolean;
  officeToDelete: { id: number; name: string } | null;
  openEditModal: (office: Office) => void;
  setOfficeToDelete: (office: { id: number; name: string } | null) => void;
}

export function OfficesTable({
  offices,
  isLoading,
  isFetching,
  isDeleting,
  officeToDelete,
  openEditModal,
  setOfficeToDelete,
}: OfficesTableProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col">
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search offices..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="text-sm font-medium text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer">Filter</button>
           <button className="text-sm font-medium text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer">Export</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50/50">
            <tr>
              <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Office Name</th>
              <th className="px-4 py-4 tracking-wider border-b border-zinc-100">Assigned Manager</th>
              <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Monthly Target</th>
              <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Working Hours</th>
              <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Agents</th>
              <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Status</th>
              <th className="px-6 py-4 tracking-wider text-right border-b border-zinc-100">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading || isFetching ? (
              Array.from({ length: Math.max(offices.length, 5) }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-200/60"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-zinc-200/60 rounded"></div>
                        <div className="h-3 w-20 bg-zinc-100 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                     <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-zinc-200/60"></div>
                       <div className="h-4 w-24 bg-zinc-200/60 rounded"></div>
                     </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-16 bg-zinc-200/60 rounded mx-auto"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 bg-zinc-200/60 rounded mx-auto"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-8 bg-zinc-200/60 rounded mx-auto"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-5 w-16 bg-zinc-200/60 rounded-full mx-auto"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-8 h-8 rounded-lg bg-zinc-200/60"></div>
                      <div className="w-8 h-8 rounded-lg bg-zinc-200/60"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : offices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-medium">
                  No offices found. Create one to get started!
                </td>
              </tr>
            ) : (
              offices.map((office) => (
                <tr key={office.id} className="hover:bg-zinc-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {office.settings?.logoUrl ? (
                        <img src={office.settings.logoUrl} alt={office.name} className="w-9 h-9 rounded-xl object-cover border border-zinc-200" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-xs uppercase">
                          {office.name.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-zinc-900">{office.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Created {new Date(office.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                     <div className="flex items-center gap-2">
                        {office.managers && office.managers.length > 0 ? (
                           <>
                             <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">
                                {office.managers[0].name.substring(0, 2).toUpperCase()}
                             </div>
                             <span className="font-medium text-zinc-700">
                               {office.managers[0].name} {office.managers.length > 1 && `+${office.managers.length - 1}`}
                             </span>
                           </>
                        ) : (
                           <Link href="/dashboard/manager-management" className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5">
                             <Plus className="w-3 h-3" /> Assign Manager
                           </Link>
                        )}
                     </div>
                  </td>
                  <td className="px-4 py-4">
                    {office.settings?.monthlyGoal ? (
                      <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-zinc-800">
                            <span className="text-primary">${((office as any).currentMonthSales || 0).toLocaleString()}</span> <span className="text-zinc-400 font-normal">/ ${(office.settings.monthlyGoal || 0).toLocaleString()}</span>
                          </span>
                        </div>
                        
                        <div className="w-full max-w-[100px] h-1.5 bg-zinc-100 rounded-full overflow-hidden relative" title={`${Math.round((((office as any).currentMonthSales || 0) / office.settings.monthlyGoal) * 100)}% Completed`}>
                          <div 
                            className="absolute top-0 left-0 h-full bg-[#5252ff] rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(100, Math.max(0, (((office as any).currentMonthSales || 0) / office.settings.monthlyGoal) * 100))}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-[10px] font-bold text-zinc-400 mt-0.5">
                          {Math.round((((office as any).currentMonthSales || 0) / office.settings.monthlyGoal) * 100)}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-center font-medium text-zinc-400">-</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-zinc-500">
                    {formatAMPM(office.settings?.officeStartTime || "09:00")} - {formatAMPM(office.settings?.officeCloseTime || "17:00")}
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-zinc-500">
                    {office.agents?.length || 0}
                  </td>
                  <td className="px-4 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${office.status === 'ACTIVE' || !office.status ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${office.status === 'ACTIVE' || !office.status ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {office.status || 'Active'}
                      </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/dashboard/offices/${office.id}`}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded hover:bg-indigo-100 transition-colors cursor-pointer mr-2"
                      >
                        See Details
                      </Link>
                      <button 
                        onClick={() => openEditModal(office)}
                        className="text-zinc-400 hover:text-zinc-900 transition-colors p-2 rounded-lg hover:bg-zinc-100 cursor-pointer" title="Edit Office"
                      >
                        <Pencil className="w-4 h-4 pointer-events-none" />
                      </button>
                      <button 
                        onClick={() => setOfficeToDelete({ id: office.id, name: office.name })}
                        disabled={isDeleting && officeToDelete?.id === office.id}
                        className="text-zinc-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed" title="Delete Office"
                      >
                        <Trash2 className="w-4 h-4 pointer-events-none" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
