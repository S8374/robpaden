import React from "react";
import { UserIcon, Shield, Briefcase, Calendar, CheckCircle2, XCircle, Users } from "lucide-react";

export function UserProfileCard({ user }: { user: any }) {
  return (
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
  );
}
