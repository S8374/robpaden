import React from "react";
import { X, Loader2, Upload } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Office } from "@/redux/api/office.api";
import { parseTime, formatTime } from "../../_hooks/useOffices";
import { TIMEZONES } from "../timezones";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface OfficeFormModalProps {
  isModalOpen: boolean;
  editingOffice: Office | null;
  formData: any;
  setFormData: (data: any) => void;
  errorMsg: string;
  isCreating: boolean;
  isUpdating: boolean;
  handleCreateOrUpdateOffice: (e: React.FormEvent) => void;
  closeModal: () => void;
}

export function OfficeFormModal({
  isModalOpen,
  editingOffice,
  formData,
  setFormData,
  errorMsg,
  isCreating,
  isUpdating,
  handleCreateOrUpdateOffice,
  closeModal,
}: OfficeFormModalProps) {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">{editingOffice ? "Edit Office" : "Create New Office"}</h2>
          <button 
            onClick={closeModal}
            className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded hover:bg-zinc-100 cursor-pointer"
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
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
              autoFocus
            />
          </div>



          <div className="relative">
            <label htmlFor="timeZone" className="block text-sm font-semibold text-zinc-700 mb-1.5">Time Zone</label>
            <CustomSelect
              value={formData.timeZone}
              onChange={(value) => setFormData({ ...formData, timeZone: value })}
              options={TIMEZONES.map(tz => ({
                value: tz.value,
                label: tz.label
              }))}
            />
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
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
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
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
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
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
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
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
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
  );
}
