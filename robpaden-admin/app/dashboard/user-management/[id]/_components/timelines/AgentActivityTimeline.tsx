import React from "react";
import { useGetAgentActivityTimelineQuery } from "@/redux/api/user.api";
import { Calendar, User as UserIcon, BarChart } from "lucide-react";

export function AgentActivityTimeline({ agentId }: { agentId: number }) {
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
