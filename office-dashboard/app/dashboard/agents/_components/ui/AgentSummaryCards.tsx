import { Users, UserCheck, UserMinus, ShieldAlert } from "lucide-react";

interface AgentSummaryCardsProps {
  limitText: string;
  agentLimit: number | undefined;
  usagePercent: number;
  activeAgents: number;
  deactivatedAgents: number;
}

export function AgentSummaryCards({
  limitText,
  agentLimit,
  usagePercent,
  activeAgents,
  deactivatedAgents
}: AgentSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Agent Limit</p>
          <p className="text-2xl font-bold text-zinc-900 mb-2">{limitText}</p>
          {agentLimit && (
            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent >= 100 ? 'bg-red-500' : usagePercent >= 80 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Active Agents</p>
          <p className="text-2xl font-bold text-zinc-900">{activeAgents}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <UserMinus className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Deactivated</p>
          <p className="text-2xl font-bold text-zinc-900">{deactivatedAgents}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Pending Sync</p>
          <p className="text-2xl font-bold text-zinc-900">0</p>
        </div>
      </div>
    </div>
  );
}
