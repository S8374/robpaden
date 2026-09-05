"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetOfficesQuery, useUpdateOfficeMutation, Office } from "@/redux/api/office.api";
import { Camera, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TIMEZONES } from "../../_components/timezones";
import { CustomSelect } from "@/components/ui/CustomSelect";

const parseTime = (timeStr: string) => {
  if (!timeStr) return new Date();
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h, 10));
  d.setMinutes(parseInt(m || '0', 10));
  d.setSeconds(0);
  return d;
};

const formatTime = (date: Date | null) => {
  if (!date) return "09:00";
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

export default function OfficeSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const officeId = Number(params.id);

  const { data: officesResponse, isLoading } = useGetOfficesQuery();
  const [updateOffice, { isLoading: isUpdating }] = useUpdateOfficeMutation();

  const [office, setOffice] = useState<Office | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [weeklyResetDay, setWeeklyResetDay] = useState("1");
  const [workWeekEndDay, setWorkWeekEndDay] = useState("5");
  const [officeStartTime, setOfficeStartTime] = useState("09:00");
  const [officeCloseTime, setOfficeCloseTime] = useState("17:00");
  const [timeZone, setTimeZone] = useState("UTC");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (officesResponse?.data) {
      const found = officesResponse.data.find(o => o.id === officeId);
      if (found) {
        setOffice(found);
        setCompanyName(found.settings?.companyName || found.name);
        setMonthlyGoal(found.settings?.monthlyGoal?.toString() || "");
        setWeeklyResetDay(found.settings?.weeklyResetDay?.toString() || "1");
        setWorkWeekEndDay(found.settings?.workWeekEndDay?.toString() || "5");
        setOfficeStartTime(found.settings?.officeStartTime || "09:00");
        setOfficeCloseTime(found.settings?.officeCloseTime || "17:00");
        setTimeZone(found.settings?.timeZone || "UTC");
        setPreviewImage(found.settings?.logoUrl || null);
      }
    }
  }, [officesResponse, officeId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("monthlyGoal", monthlyGoal);
      formData.append("weeklyResetDay", weeklyResetDay);
      formData.append("workWeekEndDay", workWeekEndDay);
      formData.append("officeStartTime", officeStartTime);
      formData.append("officeCloseTime", officeCloseTime);
      formData.append("timeZone", timeZone);

      if (selectedImage) {
        formData.append("logoUrl", selectedImage);
      }

      await updateOffice({ id: officeId, data: formData }).unwrap();
      alert("Office settings updated successfully");
      router.push("/dashboard/offices");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      alert(error.data?.message || "Failed to update settings");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 h-full flex flex-col relative">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!office) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 h-full flex flex-col relative">
        <div className="flex-1 flex items-center justify-center text-zinc-500 font-medium">
          Office not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 h-full flex flex-col relative">
      <div className="flex flex-col gap-2 mb-2">
        <Link href="/dashboard/offices" className="text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1.5 text-sm font-medium w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Offices
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Settings - {office.name}</h1>
          <p className="text-sm text-zinc-500 mt-1">Configure branding, targets, and reset schedules for this office.</p>
        </div>
      </div>

      <div className=" space-y-6 max-w-4xl">
        
        {/* Branding */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-zinc-900 mb-6 tracking-tight">Branding</h2>
          
          <div className="flex items-center gap-6 mb-6">
            <div 
              className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs font-bold shrink-0 cursor-pointer overflow-hidden relative group border border-zinc-200"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? (
                <img src={previewImage} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                "LOGO"
              )}
              <div className="absolute inset-0 bg-blue-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
            >
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
              className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Sales Goals */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-zinc-900 mb-6 tracking-tight">Sales Goals</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                Monthly Team Goal
              </label>
              <input 
                type="number" 
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>
          
          <p className="text-[12px] text-zinc-400">
            Individual agent goals are managed within the Manager dashboard.
          </p>
        </div>

        {/* Reset Schedule */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-zinc-900 mb-6 tracking-tight">Reset Schedule</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                Work Week — Start Day
              </label>
              <CustomSelect
                value={weeklyResetDay}
                onChange={setWeeklyResetDay}
                options={[
                  { value: "1", label: "Monday" },
                  { value: "2", label: "Tuesday" },
                  { value: "3", label: "Wednesday" },
                  { value: "4", label: "Thursday" },
                  { value: "5", label: "Friday" },
                  { value: "6", label: "Saturday" },
                  { value: "0", label: "Sunday" }
                ]}
              />
            </div>
            <div>
              <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                Work Week — End Day
              </label>
              <CustomSelect
                value={workWeekEndDay}
                onChange={setWorkWeekEndDay}
                options={[
                  { value: "1", label: "Monday" },
                  { value: "2", label: "Tuesday" },
                  { value: "3", label: "Wednesday" },
                  { value: "4", label: "Thursday" },
                  { value: "5", label: "Friday" },
                  { value: "6", label: "Saturday" },
                  { value: "0", label: "Sunday" }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                Working Hours — Start
              </label>
              <div className="relative w-full">
                <DatePicker 
                  selected={parseTime(officeStartTime)}
                  onChange={(date: Date | null) => setOfficeStartTime(formatTime(date))}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
                Working Hours — End
              </label>
              <div className="relative w-full">
                <DatePicker 
                  selected={parseTime(officeCloseTime)}
                  onChange={(date: Date | null) => setOfficeCloseTime(formatTime(date))}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          <p className="text-[12px] text-zinc-400 leading-relaxed max-w-[650px]">
            Daily totals reset at your Working Hours start time. Weekly totals reset on your Work Week start day. Resetting never deletes historical data.
          </p>
        </div>

        {/* Timezone */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-bold text-zinc-900 mb-6 tracking-tight">Timezone</h2>
          
          <div>
            <label className="block text-[13px] text-zinc-500 mb-2 font-medium">
              Time Zone
            </label>
            <CustomSelect
              value={timeZone}
              onChange={setTimeZone}
              options={TIMEZONES.map(tz => ({
                value: tz.value,
                label: tz.label
              }))}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 pb-12">
          <button 
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-6 py-2.5 rounded-lg text-[13px] font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
