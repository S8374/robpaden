"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Building2, Plus, Search, Pencil, Trash2, X, Loader2, Upload } from "lucide-react";
import { useGetOfficesQuery, useCreateOfficeMutation, useUpdateOfficeMutation, useDeleteOfficeMutation, Office } from "@/redux/api/office.api";

const formatAMPM = (timeStr: string) => {
  if (!timeStr) return "";
  const [hourStr, minute] = timeStr.split(":");
  if (!hourStr || !minute) return timeStr;
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  const hourFormatted = hour < 10 ? `0${hour}` : hour;
  return `${hourFormatted}:${minute} ${ampm}`;
};

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

export default function OfficesPage() {
  const { data, isLoading, isFetching } = useGetOfficesQuery();
  const [createOffice, { isLoading: isCreating }] = useCreateOfficeMutation();
  const [updateOffice, { isLoading: isUpdating }] = useUpdateOfficeMutation();
  const [deleteOffice, { isLoading: isDeleting }] = useDeleteOfficeMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [officeToDelete, setOfficeToDelete] = useState<{id: number, name: string} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    timeZone: "UTC",
    officeStartTime: "09:00",
    officeCloseTime: "17:00",
    monthlyGoal: ""
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const offices = data?.data || [];

  const handleCreateOrUpdateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Office name is required");
      return;
    }
    
    try {
      const payload = new FormData();
      if (editingOffice) {
        payload.append("companyName", formData.name);
      } else {
        payload.append("name", formData.name);
      }
      payload.append("timeZone", formData.timeZone);
      payload.append("officeStartTime", formData.officeStartTime);
      payload.append("officeCloseTime", formData.officeCloseTime);
      if (formData.monthlyGoal) payload.append("monthlyGoal", formData.monthlyGoal);
      if (logoFile) payload.append("logoUrl", logoFile);

      let res;
      if (editingOffice) {
        res = await updateOffice({ id: editingOffice.id, data: payload }).unwrap();
      } else {
        res = await createOffice(payload).unwrap();
      }

      if (res.success) {
        closeModal();
      } else {
        setErrorMsg(res.message || "Failed to save office");
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Something went wrong.");
    }
  };

  const openEditModal = (office: Office) => {
    setEditingOffice(office);
    setFormData({
      name: office.name,
      timeZone: office.settings?.timeZone || "UTC",
      officeStartTime: office.settings?.officeStartTime || "09:00",
      officeCloseTime: office.settings?.officeCloseTime || "17:00",
      monthlyGoal: office.settings?.monthlyGoal ? String(office.settings.monthlyGoal) : ""
    });
    setLogoFile(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingOffice(null);
    setFormData({
      name: "",
      timeZone: "UTC",
      officeStartTime: "09:00",
      officeCloseTime: "17:00",
      monthlyGoal: ""
    });
    setLogoFile(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffice(null);
    setLogoFile(null);
    setErrorMsg("");
  };

  const handleDeleteOffice = async () => {
    if (!officeToDelete) return;
    try {
      await deleteOffice(officeToDelete.id).unwrap();
      setOfficeToDelete(null);
    } catch (error) {
      console.error("Failed to delete office:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Offices</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage onboarding, settings, and targets for all offices.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={openCreateModal}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Office
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search offices..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
             <button className="text-sm font-medium text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer">Filter</button>
             <button className="text-sm font-medium text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer">Export</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50/50">
              <tr>
                <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Office Name</th>
                <th className="px-4 py-4 tracking-wider border-b border-zinc-100">Assigned Manager</th>
                <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Monthly Target</th>
                <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Working Hours</th>
                <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Agents</th>
                <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Status</th>
                <th className="px-6 py-4 tracking-wider text-right border-b border-zinc-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading || isFetching ? (
                Array.from({ length: offices.length || 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-200/60"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-zinc-200/60 rounded"></div>
                          <div className="h-3 w-20 bg-zinc-100 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-full bg-zinc-200/60"></div>
                         <div className="h-4 w-24 bg-zinc-200/60 rounded"></div>
                       </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 bg-zinc-200/60 rounded mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-zinc-200/60 rounded mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-8 bg-zinc-200/60 rounded mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-16 bg-zinc-200/60 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-200/60"></div>
                        <div className="w-8 h-8 rounded-lg bg-zinc-200/60"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : offices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    No offices found. Create one to get started!
                  </td>
                </tr>
              ) : (
                offices.map((office) => (
                  <tr key={office.id} className="hover:bg-zinc-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {office.settings?.logoUrl ? (
                          <img src={office.settings.logoUrl} alt={office.name} className="w-9 h-9 rounded-xl object-cover border border-zinc-200" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-xs uppercase">
                            {office.name.substring(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-zinc-900">{office.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Created {new Date(office.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex items-center gap-2">
                          {office.managers && office.managers.length > 0 ? (
                             <>
                               <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">
                                  {office.managers[0].name.substring(0, 2).toUpperCase()}
                               </div>
                               <span className="font-medium text-zinc-700">
                                 {office.managers[0].name} {office.managers.length > 1 && `+${office.managers.length - 1}`}
                               </span>
                             </>
                          ) : (
                             <Link href="/dashboard/user-management" className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5">
                               <Plus className="w-3 h-3" /> Assign Manager
                             </Link>
                          )}
                       </div>
                    </td>
                    <td className="px-4 py-4">
                      {office.settings?.monthlyGoal ? (
                        <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-zinc-800">
                              <span className="text-primary">${((office as any).currentMonthSales || 0).toLocaleString()}</span> <span className="text-zinc-400 font-normal">/ ${(office.settings.monthlyGoal || 0).toLocaleString()}</span>
                            </span>
                          </div>
                          
                          <div className="w-full max-w-[100px] h-1.5 bg-zinc-100 rounded-full overflow-hidden relative" title={`${Math.round((((office as any).currentMonthSales || 0) / office.settings.monthlyGoal) * 100)}% Completed`}>
                            <div 
                              className="absolute top-0 left-0 h-full bg-[#5252ff] rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${Math.min(100, Math.max(0, (((office as any).currentMonthSales || 0) / office.settings.monthlyGoal) * 100))}%` }}
                            ></div>
                          </div>
                          
                          <div className="text-[10px] font-bold text-zinc-400 mt-0.5">
                            {Math.round((((office as any).currentMonthSales || 0) / office.settings.monthlyGoal) * 100)}%
                          </div>
                        </div>
                      ) : (
                        <div className="text-center font-medium text-zinc-400">-</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-zinc-500">
                      {formatAMPM(office.settings?.officeStartTime || "09:00")} - {formatAMPM(office.settings?.officeCloseTime || "17:00")}
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-zinc-500">
                      {office.agents?.length || 0}
                    </td>
                    <td className="px-4 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${office.status === 'ACTIVE' || !office.status ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${office.status === 'ACTIVE' || !office.status ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {office.status || 'Active'}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(office)}
                          className="text-zinc-400 hover:text-zinc-900 transition-colors p-2 rounded-lg hover:bg-zinc-100 cursor-pointer" title="Edit Office"
                        >
                          <Pencil className="w-4 h-4 pointer-events-none" />
                        </button>
                        <button 
                          onClick={() => setOfficeToDelete({ id: office.id, name: office.name })}
                          disabled={isDeleting && officeToDelete?.id === office.id}
                          className="text-zinc-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed" title="Delete Office"
                        >
                          <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Office Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900">{editingOffice ? "Edit Office" : "Create New Office"}</h2>
              <button 
                onClick={closeModal}
                className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdateOffice} className="p-5 flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 mb-1.5">Office Name *</label>
                <input 
                  id="name"
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Solar Solutions"
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Office Logo</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-sm">
                    {logoFile ? (
                      <span className="font-medium text-zinc-900">{logoFile.name}</span>
                    ) : (
                      <span className="text-zinc-500">Click to upload a logo image...</span>
                    )}
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <div>
                <label htmlFor="timeZone" className="block text-sm font-semibold text-zinc-700 mb-1.5">Time Zone</label>
                <select 
                  id="timeZone"
                  value={formData.timeZone}
                  onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="officeStartTime" className="block text-sm font-semibold text-zinc-700 mb-1.5">Office Start Time</label>
                  <DatePicker
                    id="officeStartTime"
                    selected={parseTime(formData.officeStartTime)}
                    onChange={(date: Date | null) => setFormData({ ...formData, officeStartTime: formatTime(date) })}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="officeCloseTime" className="block text-sm font-semibold text-zinc-700 mb-1.5">Office Close Time</label>
                  <DatePicker
                    id="officeCloseTime"
                    selected={parseTime(formData.officeCloseTime)}
                    onChange={(date: Date | null) => setFormData({ ...formData, officeCloseTime: formatTime(date) })}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="monthlyGoal" className="block text-sm font-semibold text-zinc-700 mb-1.5">Monthly Goal ($)</label>
                  <input 
                    id="monthlyGoal"
                    type="number" 
                    value={formData.monthlyGoal}
                    onChange={(e) => setFormData({ ...formData, monthlyGoal: e.target.value })}
                    placeholder="e.g. 100000"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="mt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                >
                  {(isCreating || isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingOffice 
                    ? (isUpdating ? "Saving..." : "Save Changes") 
                    : (isCreating ? "Creating..." : "Create Office")
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {officeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              This action cannot be undone. All values associated with this office will be lost.
            </p>
            
            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={handleDeleteOffice}
                disabled={isDeleting}
                className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete office"}
              </button>
              <button 
                onClick={() => setOfficeToDelete(null)}
                disabled={isDeleting}
                className="w-full bg-white hover:bg-zinc-50 text-zinc-700 font-medium py-2.5 border border-zinc-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
