"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User as UserIcon, Shield, Briefcase, Calendar, CheckCircle2, XCircle, Users, Activity, BarChart, Target, Mail, Building } from "lucide-react";
import { useGetUserDetailsQuery, useGetManagerActivityTimelineQuery, useDeleteUserMutation, useToggleUserStatusMutation, useGetAgentActivityTimelineQuery } from "@/redux/api/user.api";
import { useRouter } from "next/navigation";

function ManagerActivityTimeline({ managerId }: { managerId: number }) {
  const { data, isLoading } = useGetManagerActivityTimelineQuery(managerId);
  const router = useRouter();

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500">Loading timeline...</div>;
  }

  const timeline = data?.data || [];

  if (timeline.length === 0) {
    return <div className="p-8 text-center text-zinc-500">No activity history found.</div>;
  }

  // Group by Date string, then by Agent ID
  const grouped = timeline.reduce((acc: any, item: any) => {
    const d = new Date(item.date);
    const dateStr = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    if (!acc[dateStr]) acc[dateStr] = {};
    if (!acc[dateStr][item.agentId]) {
      acc[dateStr][item.agentId] = {
        agentName: item.agentName,
        agentId: item.agentId,
        actions: []
      };
    }
    acc[dateStr][item.agentId].actions.push(item);
    return acc;
  }, {});

  return (
    <div className="p-5 space-y-8 max-h-[600px] overflow-y-auto">
      {Object.entries(grouped).map(([dateStr, agents]: [string, any], dateIdx) => (
        <div key={dateStr} className="space-y-4">
          <div className="sticky top-0 bg-white z-20 pb-2 border-b border-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <h4 className="font-bold text-zinc-800 text-sm">{dateStr}</h4>
          </div>
          
          <div className="space-y-3 pl-2">
            {Object.values(agents).map((agentGroup: any) => (
              <details key={agentGroup.agentId} className="group bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-zinc-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold uppercase text-xs">
                      {agentGroup.agentName.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">{agentGroup.agentName}</p>
                      <p className="text-xs text-zinc-500">{agentGroup.actions.length} action{agentGroup.actions.length !== 1 ? 's' : ''} recorded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => {
                        e.preventDefault(); // prevent expanding the details tag
                        router.push(`/dashboard/user-management/${agentGroup.agentId}`);
                      }}
                      className="text-xs px-3 py-1.5 bg-white border border-zinc-200 shadow-sm rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                    >
                      See Details
                    </button>
                    <div className="text-zinc-400 group-open:rotate-180 transition-transform duration-200">
                      ▼
                    </div>
                  </div>
                </summary>
                
                <div className="p-4 border-t border-zinc-200 bg-white space-y-4">
                  {agentGroup.actions.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 relative">
                      {idx !== agentGroup.actions.length - 1 && (
                        <div className="absolute left-3.5 top-7 bottom-[-20px] w-[2px] bg-zinc-100"></div>
                      )}
                      
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] ${
                        item.type === 'SALE' ? (item.action === 'REVERSED' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600') : 
                        (item.action === 'AGENT_DEACTIVATED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')
                      }`}>
                        {item.type === 'SALE' ? <BarChart className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                      </div>
                      
                      <div className="flex-1 pb-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-semibold text-zinc-900">
                            {item.type === 'SALE' ? (
                              item.action === 'ADDED' ? 'Added sales' : 
                              item.action === 'EDITED' ? 'Edited sales' : 'Reversed sales'
                            ) : (
                              item.action === 'AGENT_ADDED' ? 'Added agent' :
                              item.action === 'AGENT_UPDATED' ? 'Updated profile' :
                              item.action === 'AGENT_DEACTIVATED' ? 'Deactivated agent' : 'Activated agent'
                            )}
                          </p>
                          <span className="text-xs text-zinc-400 font-medium">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        
                        {item.type === 'SALE' && item.details && (
                          <div className="mt-1.5 p-2.5 bg-zinc-50 rounded-lg text-xs text-zinc-600 border border-zinc-100 inline-block">
                            {item.action === 'ADDED' ? <span className="font-medium text-emerald-600">Count: +{item.details.newAmount}</span> : 
                             item.action === 'EDITED' ? <span>Changed from <span className="font-medium line-through text-zinc-400">{item.details.previousAmount}</span> to <span className="font-medium text-blue-600">{item.details.newAmount}</span></span> :
                             <span className="font-medium text-red-600">Reversed count: -{item.details.previousAmount}</span>}
                          </div>
                        )}
                        
                        {item.type === 'AGENT' && item.details?.note && (
                          <div className="mt-1.5 p-2.5 bg-zinc-50 rounded-lg text-xs text-zinc-600 border border-zinc-100">
                            {item.details.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentActivityTimeline({ agentId }: { agentId: number }) {
  const { data, isLoading } = useGetAgentActivityTimelineQuery(agentId);

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500">Loading timeline...</div>;
  }

  const timeline = data?.data || [];

  if (timeline.length === 0) {
    return <div className="p-8 text-center text-zinc-500">No activity history found.</div>;
  }

  const grouped = timeline.reduce((acc: any, item: any) => {
    const d = new Date(item.date);
    const dateStr = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(item);
    return acc;
  }, {});

  return (
    <div className="p-5 space-y-8 max-h-[600px] overflow-y-auto">
      {Object.entries(grouped).map(([dateStr, actions]: [string, any]) => (
        <div key={dateStr} className="space-y-4">
          <div className="sticky top-0 bg-white z-20 pb-2 border-b border-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <h4 className="font-bold text-zinc-800 text-sm">{dateStr}</h4>
          </div>
          
          <div className="space-y-4 pl-4 pt-2">
            {actions.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 relative">
                {idx !== actions.length - 1 && (
                  <div className="absolute left-3.5 top-7 bottom-[-24px] w-[2px] bg-zinc-100"></div>
                )}
                
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] ${
                  item.type === 'SALE' ? (item.action === 'REVERSED' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600') : 
                  (item.action === 'AGENT_DEACTIVATED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')
                }`}>
                  {item.type === 'SALE' ? <BarChart className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-900">
                      {item.type === 'SALE' ? (
                        item.action === 'ADDED' ? 'Added sales' : 
                        item.action === 'EDITED' ? 'Edited sales' : 'Reversed sales'
                      ) : (
                        item.action === 'AGENT_ADDED' ? 'Added agent' :
                        item.action === 'AGENT_UPDATED' ? 'Updated profile' :
                        item.action === 'AGENT_DEACTIVATED' ? 'Deactivated agent' : 'Activated agent'
                      )}
                    </p>
                    <span className="text-xs text-zinc-500 font-medium px-2 py-0.5 bg-zinc-100 rounded-full">
                      by {item.managerName}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  
                  {item.type === 'SALE' && item.details && (
                    <div className="mt-2 p-2.5 bg-zinc-50 rounded-lg text-xs text-zinc-600 border border-zinc-100 inline-block">
                      {item.action === 'ADDED' ? <span className="font-medium text-emerald-600">Count: +{item.details.newAmount}</span> : 
                       item.action === 'EDITED' ? <span>Changed from <span className="font-medium line-through text-zinc-400">{item.details.previousAmount}</span> to <span className="font-medium text-blue-600">{item.details.newAmount}</span></span> :
                       <span className="font-medium text-red-600">Reversed count: -{item.details.previousAmount}</span>}
                    </div>
                  )}
                  
                  {item.type === 'AGENT' && item.details?.note && (
                    <div className="mt-2 p-2.5 bg-zinc-50 rounded-lg text-xs text-zinc-600 border border-zinc-100">
                      {item.details.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const userId = parseInt(unwrappedParams.id, 10);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'agents' | 'activity'>('agents');
  
  const { data, isLoading, isError } = useGetUserDetailsQuery(userId, {
    skip: isNaN(userId),
  });

  const [deleteUser] = useDeleteUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();

  const handleDeleteAgent = async (agentId: number) => {
    if (confirm("Are you sure you want to delete this agent? This cannot be undone.")) {
      await deleteUser(agentId);
    }
  };

  const handleToggleStatus = async (agentId: number, currentStatus: boolean) => {
    await toggleStatus({ id: agentId, isActive: !currentStatus });
  };

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
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-px">
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${
                activeTab === 'agents' ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Managed Agents
              {activeTab === 'agents' && (
                <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${
                activeTab === 'activity' ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Activity History
              {activeTab === 'activity' && (
                <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
              )}
            </button>
          </div>

          {activeTab === 'agents' && (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-zinc-900">Managed Agents ({user.agents?.length || 0})</h3>
              </div>
            
              <div className="overflow-x-auto pb-4">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50/50">
                    <tr>
                      <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Agent Name</th>
                      <th className="px-4 py-4 tracking-wider border-b border-zinc-100 text-center">Status</th>
                      <th className="px-4 py-4 tracking-wider border-b border-zinc-100 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {!user.agents || user.agents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                          No agents currently managed.
                        </td>
                      </tr>
                    ) : (
                      user.agents.map((agent: any) => (
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
                                onClick={() => router.push(`/dashboard/user-management/${agent.id}`)}
                                className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded hover:bg-indigo-100 transition-colors"
                              >
                                View Details
                              </button>
                              <button 
                                onClick={() => handleToggleStatus(agent.id, agent.isActive)}
                                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${agent.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                              >
                                {agent.isActive ? 'Block' : 'Unblock'}
                              </button>
                              <button 
                                onClick={() => handleDeleteAgent(agent.id)}
                                className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded hover:bg-red-100 transition-colors"
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
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-zinc-900">Activity History</h3>
              </div>
              <ManagerActivityTimeline managerId={user.id} />
            </div>
          )}
        </div>
      )}

      {user.role === "AGENT" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manager Details */}
          <div className="group relative overflow-hidden bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 group-hover:bg-blue-100 transition-colors"></div>
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-100/60">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                   <Shield className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-zinc-900 text-lg tracking-tight">Manager Details</h3>
              </div>
              {user.manager ? (
                <div className="flex items-center gap-4 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100/50 group-hover:border-blue-100/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-600 font-bold uppercase text-lg shadow-inner">
                    {user.manager.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-[15px]">{user.manager.name}</p>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.manager.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 bg-zinc-50/50 rounded-xl border border-zinc-100 border-dashed">
                  <p className="text-sm font-medium text-zinc-500">No manager assigned</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Agent Goals */}
          <div className="group relative overflow-hidden bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 group-hover:bg-amber-100 transition-colors"></div>
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-100/60">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/20">
                   <Target className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-zinc-900 text-lg tracking-tight">Agent Goals</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-gradient-to-b from-white to-zinc-50/80 border border-zinc-100 rounded-xl text-center group-hover:border-amber-100/50 transition-colors">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Daily</p>
                  <p className="text-2xl font-black text-zinc-800">{user.dailyGoal || 0}</p>
                </div>
                <div className="p-4 bg-gradient-to-b from-white to-zinc-50/80 border border-zinc-100 rounded-xl text-center group-hover:border-amber-100/50 transition-colors">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Weekly</p>
                  <p className="text-2xl font-black text-zinc-800">{user.weeklyGoal || 0}</p>
                </div>
                <div className="p-4 bg-gradient-to-b from-white to-zinc-50/80 border border-zinc-100 rounded-xl text-center group-hover:border-amber-100/50 transition-colors">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Monthly</p>
                  <p className="text-2xl font-black text-zinc-800">{user.monthlyGoal || 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Performance */}
          <div className="md:col-span-2 group relative overflow-hidden bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 group-hover:bg-emerald-100 transition-colors pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-20 -mb-20 opacity-60 group-hover:bg-indigo-100 transition-colors pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-100/60">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                   <BarChart className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-zinc-900 text-lg tracking-tight">Current Performance</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden p-5 bg-white border border-emerald-100/60 rounded-xl group-hover:border-emerald-200 transition-colors shadow-sm shadow-emerald-500/5">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100/80 to-emerald-50/50 opacity-50 rounded-bl-full pointer-events-none"></div>
                  <div className="relative">
                    <p className="text-xs text-emerald-600/80 font-bold uppercase tracking-wider mb-2">Today's Sales</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-emerald-600 leading-none">{user.performance?.daily || 0}</p>
                      <span className="text-sm font-semibold text-emerald-600/60 mb-1">/ {user.dailyGoal || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden p-5 bg-white border border-indigo-100/60 rounded-xl group-hover:border-indigo-200 transition-colors shadow-sm shadow-indigo-500/5">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100/80 to-indigo-50/50 opacity-50 rounded-bl-full pointer-events-none"></div>
                  <div className="relative">
                    <p className="text-xs text-indigo-600/80 font-bold uppercase tracking-wider mb-2">This Week</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-indigo-600 leading-none">{user.performance?.weekly || 0}</p>
                      <span className="text-sm font-semibold text-indigo-600/60 mb-1">/ {user.weeklyGoal || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden p-5 bg-white border border-purple-100/60 rounded-xl group-hover:border-purple-200 transition-colors shadow-sm shadow-purple-500/5">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100/80 to-purple-50/50 opacity-50 rounded-bl-full pointer-events-none"></div>
                  <div className="relative">
                    <p className="text-xs text-purple-600/80 font-bold uppercase tracking-wider mb-2">This Month</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-purple-600 leading-none">{user.performance?.monthly || 0}</p>
                      <span className="text-sm font-semibold text-purple-600/60 mb-1">/ {user.monthlyGoal || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm md:col-span-2">
             <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-zinc-900">Sales History</h3>
             </div>
             
             <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50/50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Date</th>
                      <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Sales Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {!user.performanceRecords || user.performanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-zinc-500">
                          No sales history found for this agent.
                        </td>
                      </tr>
                    ) : (
                      user.performanceRecords.map((record: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4 text-zinc-500 font-medium">
                            {new Date(record.startDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full">{record.salesCount}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm md:col-span-2">
             <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-zinc-900">Manager Actions (Audit)</h3>
             </div>
             
             <AgentActivityTimeline agentId={user.id} />
          </div>
        </div>
      )}
    </div>
  );
}
