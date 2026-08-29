import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Building2, Users, UsersRound, MonitorPlay } from "lucide-react";

interface SystemActivityFeedProps {
  activities: any[];
}

export function SystemActivityFeed({ activities }: SystemActivityFeedProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-zinc-800 mb-4">System Activity</h2>
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-y-auto p-5 space-y-4 max-h-[450px]">
        {activities && activities.length > 0 ? (
          activities.map((activity: any) => {
            let Icon = Building2;
            let iconColor = "text-blue-500";
            if (activity.iconType === "Users") { Icon = Users; iconColor = "text-indigo-500"; }
            if (activity.iconType === "UsersRound") { Icon = UsersRound; iconColor = "text-emerald-500"; }
            if (activity.iconType === "MonitorPlay") { Icon = MonitorPlay; iconColor = "text-amber-500"; }
            
            return (
              <div key={activity.id} className="flex gap-4">
                 <div className="mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                       <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                 </div>
                 <div>
                    <p className="text-sm font-semibold text-zinc-900">{activity.action}</p>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5">{activity.entityName}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
                 </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-zinc-500 text-center py-4">No recent activity</div>
        )}
      </div>
    </div>
  );
}
