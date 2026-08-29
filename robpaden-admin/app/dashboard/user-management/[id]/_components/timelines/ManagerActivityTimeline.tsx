import React from "react";
import { useGetManagerActivityTimelineQuery } from "@/redux/api/user.api";
import { useRouter } from "next/navigation";
import { Calendar, User as UserIcon, BarChart } from "lucide-react";

export function ManagerActivityTimeline({ managerId }: { managerId: number }) {
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
                      className="text-xs px-3 py-1.5 bg-white border border-zinc-200 shadow-sm rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer"
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
