import React from "react";
import { TrendingUp, Building2, Users } from "lucide-react";

interface TopPerformersTablesProps {
  topOffices: any[];
  topManagers: any[];
}

export function TopPerformersTables({ topOffices, topManagers }: TopPerformersTablesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Top Offices */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm h-fit">
        <div className="p-5 border-b border-zinc-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-zinc-800">Top Offices (This Month)</h2>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50">
            <tr>
              <th className="px-5 py-3 tracking-wider border-b border-zinc-100 w-16 text-center">Rank</th>
              <th className="px-5 py-3 tracking-wider border-b border-zinc-100">Office Name</th>
              <th className="px-5 py-3 tracking-wider text-right border-b border-zinc-100">Sales / Goal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {topOffices && topOffices.length > 0 ? (
              topOffices.map((office: any, idx: number) => (
                <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3 text-center">
                    <span className="w-6 h-6 mx-auto rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-700 text-[10px] shadow-sm">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-zinc-900">{office.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-bold text-emerald-600">{office.sales}</span> 
                    <span className="text-zinc-400 font-medium"> / {office.goal || 0}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-sm text-zinc-500">
                  No sales data this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Top Managers */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm h-fit">
        <div className="p-5 border-b border-zinc-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-zinc-800">Top Managers</h2>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50">
            <tr>
              <th className="px-5 py-3 tracking-wider border-b border-zinc-100 w-16 text-center">Rank</th>
              <th className="px-5 py-3 tracking-wider border-b border-zinc-100">Manager Name</th>
              <th className="px-5 py-3 tracking-wider text-right border-b border-zinc-100">Sales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {topManagers && topManagers.length > 0 ? (
              topManagers.map((manager: any, idx: number) => (
                <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3 text-center">
                    <span className="w-6 h-6 mx-auto rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-700 text-[10px] shadow-sm">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-zinc-900">{manager.name}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                      {manager.sales}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-sm text-zinc-500">
                  No manager performance data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
