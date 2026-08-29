import React from "react";
import { X, Loader2, Upload } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Office } from "@/redux/api/office.api";
import { parseTime, formatTime } from "../../_hooks/useOffices";

interface OfficeFormModalProps {
  isModalOpen: boolean;
  editingOffice: Office | null;
  formData: any;
  setFormData: (data: any) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  celebrationSoundFile: File | null;
  setCelebrationSoundFile: (file: File | null) => void;
  errorMsg: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  soundInputRef: React.RefObject<HTMLInputElement | null>;
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
  logoFile,
  setLogoFile,
  celebrationSoundFile,
  setCelebrationSoundFile,
  errorMsg,
  fileInputRef,
  soundInputRef,
  isCreating,
  isUpdating,
  handleCreateOrUpdateOffice,
  closeModal,
}: OfficeFormModalProps) {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
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
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">TV Celebration Sound/Video</label>
            <div 
              onClick={() => soundInputRef.current?.click()}
              className="w-full px-4 py-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 cursor-pointer flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 rounded bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-sm">
                {celebrationSoundFile ? (
                  <span className="font-medium text-zinc-900">{celebrationSoundFile.name}</span>
                ) : (
                  <span className="text-zinc-500">Click to upload a sound/video file...</span>
                )}
              </div>
            </div>
            <input 
              type="file" 
              ref={soundInputRef}
              onChange={(e) => setCelebrationSoundFile(e.target.files?.[0] || null)}
              className="hidden"
              accept="audio/*,video/*"
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
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
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
