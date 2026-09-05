"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { AgentsTable } from "@/components/dashboard/tables/AgentsTable";
import { RecentSales } from "@/components/dashboard/ui/RecentSales";
import { RankingList } from "@/components/dashboard/ui/RankingList";
import { SalesCard } from "@/components/dashboard/ui/SalesCard";
import { GoalCard } from "@/components/dashboard/ui/GoalCard";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Header } from "@/components/dashboard/layout/Header";

import { useGetManagerDashboardQuery } from "@/redux/api/agent.api";

export default function DashboardPage() {
  const selectedDateStr = useSelector((state: RootState) => state.date.selectedDate);
  const selectedDate = new Date(selectedDateStr);
  
  const queryDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetManagerDashboardQuery({ date: queryDate });
  
  // The data payload from the API will be inside `dashboardData.data`
  const dashboard = dashboardData?.data;

  // We can use the real loading state now
  const isLoading = isDashboardLoading;

  // Helper to convert the raw chart data to percentage heights
  const formatBars = (chartArray: any[]) => {
    if (!chartArray || chartArray.length === 0) return [];
    const max = Math.max(...chartArray.map(item => item.sales), 1); // Avoid division by zero
    return chartArray.map(item => ({
      height: (item.sales / max) * 100,
      active: item.sales > 0,
      label: item.label,
      sales: item.sales
    }));
  };

  const todayBars = formatBars(dashboard?.today?.chart);
  const weekBars = formatBars(dashboard?.week?.chart);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header title="Dashboard" />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden p-4 md:p-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Left Column (Main Stats + Agents Table) */}
        <div className="lg:col-span-2 space-y-6 lg:overflow-y-auto lg:pr-4 lg:pb-8 custom-scrollbar">
          {/* Top Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SalesCard 
              isLoading={isLoading}
              title="Today's Team Sales" 
              value={dashboard?.today?.total?.toString() || "0"} 
              subtitle="Pace by hour, today"
              startTime={dashboard?.today?.startTime}
              endTime={dashboard?.today?.endTime}
              bars={todayBars} 
            />
            <SalesCard 
              isLoading={isLoading}
              title="This Week's Team Sales" 
              value={dashboard?.week?.total?.toString() || "0"} 
              subtitle={`Daily totals, ${dashboard?.week?.startTime || "Mon"}-${dashboard?.week?.endTime || "Sun"}`}
              startTime={dashboard?.week?.startTime || "Mon"}
              endTime={dashboard?.week?.endTime || "Sun"}
              bars={weekBars} 
            />
          </div>

          {/* Goals Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <GoalCard 
              isLoading={isLoading} 
              title="Daily Goal" 
              percentage={dashboard?.goals?.daily?.progress || 0} 
              fraction={`${dashboard?.today?.total || 0} / ${dashboard?.goals?.daily?.target || 150}`} 
             />
             <GoalCard 
              isLoading={isLoading} 
              title="Weekly Goal" 
              percentage={dashboard?.goals?.weekly?.progress || 0} 
              fraction={`${dashboard?.week?.total || 0} / ${dashboard?.goals?.weekly?.target || 500}`} 
             />
          </div>

          {/* Agents Table */}
          <div>
            <h2 className="text-lg font-bold text-zinc-800 mb-4">Agents</h2>
            <AgentsTable isLoading={isLoading} date={queryDate} />
          </div>
        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-6 lg:overflow-y-auto lg:pr-4 lg:pb-8 custom-scrollbar">
          {/* Recent Sales */}
          <div>
            <h2 className="text-sm font-bold text-zinc-800 mb-3">Recent Sales</h2>
            <RecentSales isLoading={isLoading} data={dashboard?.recent} />
          </div>

          {/* Today's Ranking */}
          <div>
            <h2 className="text-sm font-bold text-zinc-800 mb-3">Today's Ranking</h2>
            <RankingList isLoading={isLoading} data={dashboard?.ranking} />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
