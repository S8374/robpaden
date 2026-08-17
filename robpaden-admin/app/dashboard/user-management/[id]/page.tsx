"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, User as UserIcon, Shield, Briefcase, Calendar, CheckCircle2, XCircle, Users, Activity, BarChart, Target, Mail, Building } from "lucide-react";
import { useGetUserDetailsQuery } from "@/redux/api/user.api";
import { useRouter } from "next/navigation";

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const userId = parseInt(unwrappedParams.id, 10);
  
  const { data, isLoading, isError } = useGetUserDetailsQuery(userId, {
    skip: isNaN(userId),
  });

  const user = data?.data;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium">Failed to load user details or user not found.</p>
        <Link href="/dashboard/user-management" className="text-indigo-600 hover:underline mt-4 inline-block">
          Return to User Management
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 h-full">
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/user-management"
          className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">User Details</h1>
          <p className="text-sm text-zinc-500 mt-1">Viewing full profile and assigned resources.</p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <span className="text-3xl font-bold uppercase">{user.name.substring(0, 2)}</span>
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">{user.name}</h2>
              <p className="text-zinc-500 flex items-center gap-2 mt-1">
                <UserIcon className="w-4 h-4" /> {user.email}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1.5 ${
                user.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 
                user.role === 'MANAGER' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                'bg-zinc-50 text-zinc-600 border-zinc-200'
              }`}>
                <Shield className="w-3.5 h-3.5" />
                {user.role}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1.5 ${
                user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {user.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {user.isActive ? 'Active' : 'Blocked'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Assigned Office</p>
                <p className="text-sm font-semibold text-zinc-900">{user.company?.name || "None"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Joined Date</p>
                <p className="text-sm font-semibold text-zinc-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {user.role === "MANAGER" && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium">Agent Limit</p>
                  <p className="text-sm font-semibold text-zinc-900">
                    {user.agentLimit !== null && user.agentLimit !== undefined ? (
                       <span>{user.agents?.length || 0} / {user.agentLimit} Used</span>
                    ) : (
                       <span>Unlimited</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Specific Content */}
      {user.role === "MANAGER" && (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-zinc-900">Managed Agents ({user.agents?.length || 0})</h3>
            </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50/50">
                <tr>
                  <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Agent Name</th>
                  <th className="px-4 py-4 tracking-wider border-b border-zinc-100">Email</th>
                  <th className="px-4 py-4 tracking-wider border-b border-zinc-100 text-center">Status</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {!user.agents || user.agents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                      No agents currently managed.
                    </td>
                  </tr>
                ) : (
                  user.agents.map((agent: any) => (
                    <tr key={agent.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-zinc-900">{agent.name}</td>
                      <td className="px-4 py-4 text-zinc-500">{agent.email}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${agent.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
          

        </div>
      )}

      {user.role === "AGENT" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
             <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-zinc-900">Manager Details</h3>
             </div>
             {user.manager ? (
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold uppercase">
                   {user.manager.name.substring(0, 2)}
                 </div>
                 <div>
                   <p className="font-semibold text-zinc-900">{user.manager.name}</p>
                   <p className="text-xs text-zinc-500">{user.manager.email}</p>
                 </div>
               </div>
             ) : (
               <p className="text-sm text-zinc-500">This agent has no assigned manager.</p>
             )}
          </div>


        </div>
      )}
    </div>
  );
}
