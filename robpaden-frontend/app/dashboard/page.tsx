"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { AgentsTable } from "@/components/dashboard/AgentsTable";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { RankingList } from "@/components/dashboard/RankingList";
import { SalesCard } from "@/components/dashboard/SalesCard";
import { GoalCard } from "@/components/dashboard/GoalCard";

import { Header } from "@/components/dashboard/Header";

export default function DashboardPage() {
  // Mock loading state for demonstration of skeleton loaders
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
              value="120" 
              subtitle="Pace by hour, today"
              bars={[
                { height: 20 }, { height: 20 }, { height: 30 }, 
                { height: 100, active: true }, 
                { height: 40 }, { height: 20 }, { height: 20 }
              ]} 
            />
            <SalesCard 
              isLoading={isLoading}
              title="This Week's Team Sales" 
              value="680" 
              subtitle="Daily totals, Mon-Sun"
              bars={[
                { height: 30 }, { height: 40 }, { height: 30 }, 
                { height: 100, active: true }, 
                { height: 50 }, { height: 30 }, { height: 20 }
              ]} 
            />
          </div>

          {/* Goals Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <GoalCard isLoading={isLoading} title="Daily Goal" percentage={79} fraction="119 / 150" />
             <GoalCard isLoading={isLoading} title="Weekly Goal" percentage={79} fraction="119 / 150" />
          </div>

          {/* Agents Table */}
          <div>
            <h2 className="text-lg font-bold text-zinc-800 mb-4">Agents</h2>
            <AgentsTable isLoading={isLoading} />
          </div>
        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-6 lg:overflow-y-auto lg:pr-4 lg:pb-8 custom-scrollbar">
          {/* Recent Sales */}
          <div>
            <h2 className="text-sm font-bold text-zinc-800 mb-3">Recent Sales</h2>
            <RecentSales isLoading={isLoading} />
          </div>

          {/* Today's Ranking */}
          <div>
            <h2 className="text-sm font-bold text-zinc-800 mb-3">Today's Ranking</h2>
            <RankingList isLoading={isLoading} />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
