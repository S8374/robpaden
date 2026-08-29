"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/layout/Header";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Office A");
  const [dailyGoal, setDailyGoal] = useState("150");
  const [weeklyGoal, setWeeklyGoal] = useState("900");
  const [startDay, setStartDay] = useState("Monday");
  const [endDay, setEndDay] = useState("Friday");
  const [startHour, setStartHour] = useState("09:00");
  const [endHour, setEndHour] = useState("17:00");
  const [timeZone, setTimeZone] = useState("Eastern Time (US & Canada)");

  const handleSave = () => {
    // Save logic here
    console.log("Saving settings...");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-zinc-50/50">
      <Header title="Settings" />

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className=" space-y-6">
          
          {/* Branding */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-zinc-900 mb-6 tracking-tight">Branding</h2>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs font-bold shrink-0">
                LOGO
              </div>
              <button className="text-sm font-medium text-[#5252ff] hover:text-[#4242e5] transition-colors cursor-pointer">
                Change Logo
              </button>
            </div>

            <div>
              <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                Company Name
              </label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all"
              />
            </div>
          </div>

          {/* Sales Goals */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-zinc-900 mb-6 tracking-tight">Sales Goals</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                  Daily Team Goal
                </label>
                <input 
                  type="number" 
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all"
                />
              </div>
              <div>
                <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                  Weekly Team Goal
                </label>
                <input 
                  type="number" 
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all"
                />
              </div>
            </div>
            
            <p className="text-[12px] text-zinc-400">
              Individual agent goals are set per-agent on the Agents page.
            </p>
          </div>

          {/* Reset Schedule */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-zinc-900 mb-6 tracking-tight">Reset Schedule</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                  Work Week — Start Day
                </label>
                <select 
                  value={startDay}
                  onChange={(e) => setStartDay(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2371717a\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em' }}
                >
                  <option value="Monday">Monday</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                  Work Week — End Day
                </label>
                <select 
                  value={endDay}
                  onChange={(e) => setEndDay(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2371717a\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em' }}
                >
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                  Working Hours — Start
                </label>
                <input 
                  type="time" 
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all cursor-text"
                />
              </div>
              <div>
                <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                  Working Hours — End
                </label>
                <input 
                  type="time" 
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all cursor-text"
                />
              </div>
            </div>
            
            <p className="text-[12px] text-zinc-400 leading-relaxed max-w-[650px]">
              Daily totals reset at your Working Hours start time. Weekly totals reset on your Work Week start day. Resetting never deletes historical data — all past results stay available in Reports.
            </p>
          </div>

          {/* Timezone */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-zinc-900 mb-6 tracking-tight">Timezone</h2>
            
            <div>
              <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                Time Zone
              </label>
              <select 
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2371717a\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em' }}
              >
                <option value="Eastern Time (US & Canada)">Eastern Time (US & Canada)</option>
                <option value="Central Time (US & Canada)">Central Time (US & Canada)</option>
                <option value="Mountain Time (US & Canada)">Mountain Time (US & Canada)</option>
                <option value="Pacific Time (US & Canada)">Pacific Time (US & Canada)</option>
                <option value="London">London</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 pb-12">
            <button 
              onClick={handleSave}
              className="bg-[#5252ff] hover:bg-[#4242e5] text-white px-6 py-2.5 rounded-lg text-[13px] font-bold shadow-sm transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
