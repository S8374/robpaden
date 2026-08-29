import React from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

interface OfficesOverviewTableProps {
  offices: any[];
  isLoading: boolean;
}

export function OfficesOverviewTable({ offices, isLoading }: OfficesOverviewTableProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-800">Offices Overview</h2>
        <Link href="/dashboard/offices" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 cursor-pointer">View All</Link>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50">
          <tr>
            <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Office Name</th>
            <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Managers</th>
            <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Agents</th>
            <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Status</th>
            <th className="px-6 py-4 tracking-wider text-right border-b border-zinc-100">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {isLoading ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                Loading offices...
              </td>
            </tr>
          ) : offices.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                No offices found.
              </td>
            </tr>
          ) : (
            offices.slice(0, 5).map((office) => (
              <tr key={office.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-[10px]">
                      {office.name.substring(0, 2).toUpperCase()}
                    </div>
                    <p className="font-semibold text-zinc-900">{office.name}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-center font-medium text-zinc-700">{office.managers?.length || 0}</td>
                <td className="px-4 py-4 text-center font-medium text-zinc-500">{office.agents?.length || 0}</td>
                <td className="px-4 py-4 text-center">
                   <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${office.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                     {office.status || 'Active'}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                     <Link href="/dashboard/offices" className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded hover:bg-zinc-100 cursor-pointer">
                       <MoreHorizontal className="w-4 h-4" />
                     </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
