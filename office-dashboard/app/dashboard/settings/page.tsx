"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/layout/Header";
import { CustomSelect } from "@/components/ui/CustomSelect";

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
                <CustomSelect
                  value={startDay}
                  onChange={setStartDay}
                  options={[
                    { value: "Monday", label: "Monday" },
                    { value: "Tuesday", label: "Tuesday" },
                    { value: "Wednesday", label: "Wednesday" },
                    { value: "Thursday", label: "Thursday" },
                    { value: "Friday", label: "Friday" },
                    { value: "Saturday", label: "Saturday" },
                    { value: "Sunday", label: "Sunday" }
                  ]}
                />
              </div>
              <div>
                <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                  Work Week — End Day
                </label>
                <CustomSelect
                  value={endDay}
                  onChange={setEndDay}
                  options={[
                    { value: "Monday", label: "Monday" },
                    { value: "Tuesday", label: "Tuesday" },
                    { value: "Wednesday", label: "Wednesday" },
                    { value: "Thursday", label: "Thursday" },
                    { value: "Friday", label: "Friday" },
                    { value: "Saturday", label: "Saturday" },
                    { value: "Sunday", label: "Sunday" }
                  ]}
                />
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
              <CustomSelect
                value={timeZone}
                onChange={setTimeZone}
                options={[
                  { value: "Eastern Time (US & Canada)", label: "Eastern Time (US & Canada)" },
                  { value: "Central Time (US & Canada)", label: "Central Time (US & Canada)" },
                  { value: "Mountain Time (US & Canada)", label: "Mountain Time (US & Canada)" },
                  { value: "Pacific Time (US & Canada)", label: "Pacific Time (US & Canada)" },
                  { value: "London", label: "London" },
                  { value: "UTC", label: "UTC" }
                ]}
              />
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
