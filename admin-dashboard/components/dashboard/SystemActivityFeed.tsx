import React, { useState, useMemo } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Building2, Users, UsersRound, MonitorPlay, Calendar as CalendarIcon, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SystemActivityFeedProps {
  activities: any[];
}

export function SystemActivityFeed({ activities }: SystemActivityFeedProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filteredActivities = useMemo(() => {
    if (!selectedDate || !activities) return activities;
    return activities.filter((a) => {
      const aDate = new Date(a.createdAt);
      return (
        aDate.getFullYear() === selectedDate.getFullYear() &&
        aDate.getMonth() === selectedDate.getMonth() &&
        aDate.getDate() === selectedDate.getDate()
      );
    });
  }, [activities, selectedDate]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-zinc-800">System Activity</h2>
        
        <div className="relative">
          <div className="flex items-center">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              placeholderText="Filter by Date"
              className="w-36 pl-8 pr-8 py-1.5 text-xs font-medium bg-white border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 cursor-pointer transition-all"
              dateFormat="MMM d, yyyy"
              maxDate={new Date()}
              popperPlacement="bottom-end"
            />
            <CalendarIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate(null)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 space-y-4 max-h-[450px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {selectedDate && (
          <div className="text-xs font-semibold text-zinc-500 mb-2 pb-2 border-b border-zinc-100">
            Showing activities for {format(selectedDate, "MMMM d, yyyy")}
          </div>
        )}
        
        {filteredActivities && filteredActivities.length > 0 ? (
          filteredActivities.map((activity: any) => {
            let Icon = Building2;
            let iconColor = "text-blue-500";
            if (activity.iconType === "Users") { Icon = Users; iconColor = "text-indigo-500"; }
            if (activity.iconType === "UsersRound") { Icon = UsersRound; iconColor = "text-emerald-500"; }
            if (activity.iconType === "MonitorPlay") { Icon = MonitorPlay; iconColor = "text-amber-500"; }
            
            return (
              <div key={activity.id} className="flex gap-4">
                 <div className="mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                       <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{activity.action}</p>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5 truncate">{activity.entityName}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
                 </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-zinc-500 text-center py-8">
            {selectedDate ? "No activity found for this date" : "No recent activity"}
          </div>
        )}
      </div>
    </div>
  );
}
