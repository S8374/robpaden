"use client";

import React, { use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Target, Clock, Globe, Users } from "lucide-react";
import { useGetOfficesQuery } from "@/redux/api/office.api";
import { formatAMPM } from "../_hooks/useOffices";

export default function OfficeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const officeId = parseInt(resolvedParams.id, 10);

  const { data: officesData, isLoading } = useGetOfficesQuery();
  
  const office = useMemo(() => {
    return officesData?.data?.find(o => o.id === officeId);
  }, [officesData, officeId]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (!office) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-red-500 font-medium text-lg">Office not found.</p>
        <button 
          onClick={() => router.push('/dashboard/offices')}
          className="text-indigo-600 hover:underline inline-block font-medium cursor-pointer"
        >
          Return to Office Management
        </button>
      </div>
    );
  }

  const progressPercentage = office.settings?.monthlyGoal 
    ? Math.min(100, Math.max(0, (((office as any).currentMonthSales || 0) / office.settings.monthlyGoal) * 100))
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 h-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Office Details</h1>
          <p className="text-sm text-zinc-500 mt-1">View office settings, targets, and assigned personnel.</p>
        </div>
      </div>

      {/* Office Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Office Name</p>
            <h3 className="text-lg font-bold text-zinc-900">{office.name}</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Created {new Date(office.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div className="w-full">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Monthly Target</p>
            {office.settings?.monthlyGoal ? (
              <>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-lg font-bold text-zinc-900">${((office as any).currentMonthSales || 0).toLocaleString()}</span>
                  <span className="text-xs text-zinc-500">/ ${office.settings.monthlyGoal.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden relative" title={`${Math.round(progressPercentage)}% Completed`}>
                  <div 
                    className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-400 mt-2">No target set</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Working Hours</p>
            <h3 className="text-sm font-bold text-zinc-900 mt-1">
              {formatAMPM(office.settings?.officeStartTime || "09:00")} - {formatAMPM(office.settings?.officeCloseTime || "17:00")}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-500">
              <Globe className="w-3.5 h-3.5" />
              <span>{office.settings?.timeZone || 'UTC'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Total Personnel</p>
            <div className="flex items-center gap-3 mt-1">
              <div>
                <span className="text-lg font-bold text-zinc-900">{office.managers?.length || 0}</span>
                <span className="text-xs text-zinc-500 ml-1">Managers</span>
              </div>
              <div className="w-px h-6 bg-zinc-200"></div>
              <div>
                <span className="text-lg font-bold text-zinc-900">{office.agents?.length || 0}</span>
                <span className="text-xs text-zinc-500 ml-1">Agents</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Managers Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900">Assigned Managers</h3>
          </div>
          <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md">
            {office.managers?.length || 0} Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50/50">
              <tr>
                <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Manager Name</th>
                <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Role</th>
                <th className="px-6 py-4 tracking-wider text-right border-b border-zinc-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {!office.managers || office.managers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    No managers assigned to this office.
                  </td>
                </tr>
              ) : (
                office.managers.map((manager: any) => (
                  <tr key={manager.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold uppercase">
                          {manager.name.substring(0, 2)}
                        </div>
                        <p className="font-semibold text-zinc-900">{manager.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {manager.role || 'MANAGER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/dashboard/manager-management/${manager.id}`}
                        className="inline-flex items-center justify-center px-4 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
                      >
                        See Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
