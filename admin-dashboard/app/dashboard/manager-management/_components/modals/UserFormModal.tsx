import React from "react";
import Link from "next/link";
import { X, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface UserFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
  errorMsg: string;
  successMsg: string;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  closeModal: () => void;
  offices: any[];
  managersList: any[];
  fixedRole?: "MANAGER" | "AGENT";
}

export function UserFormModal({
  isOpen,
  isEditMode,
  formData,
  setFormData,
  errorMsg,
  successMsg,
  showPassword,
  setShowPassword,
  isSubmitting,
  handleSubmit,
  closeModal,
  offices,
  managersList,
  fixedRole,
}: UserFormModalProps) {
  React.useEffect(() => {
    if (isOpen && fixedRole && formData.role !== fixedRole) {
      setFormData({ ...formData, role: fixedRole });
    }
  }, [isOpen, fixedRole, formData.role, setFormData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">{isEditMode ? "Edit User" : "Create New User"}</h2>
          <button 
            onClick={closeModal}
            className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 mb-1.5">Full Name *</label>
            <input 
              id="name"
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
              autoFocus={!isEditMode}
            />
          </div>


          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 mb-1.5">Email Address *</label>
            <input 
              id="email"
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={isEditMode ? "" : "e.g. jane@example.com"}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                {(formData.avatarFile || formData.avatarUrl) ? (
                  <img 
                    src={formData.avatarFile ? URL.createObjectURL(formData.avatarFile) : formData.avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-zinc-400 font-medium">U</span>
                )}
              </div>
              <input 
                type="file" 
                id="avatar"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, avatarFile: e.target.files?.[0] || null })}
                className="block w-full text-sm text-zinc-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-zinc-100 file:text-zinc-700
                  hover:file:bg-zinc-200 transition-colors cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 mb-1.5">Password {isEditMode ? "" : "*"}</label>
            <div className="relative">
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={isEditMode ? "Leave blank to keep current password" : "••••••••"}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!fixedRole && (
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-zinc-700 mb-1.5">Role *</label>
              <CustomSelect
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value, companyId: "", managerId: "" })}
                options={[
                  { value: "MANAGER", label: "Manager" },
                  { value: "AGENT", label: "Agent" }
                ]}
              />
            </div>
          )}

          {formData.role === "MANAGER" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label htmlFor="companyId" className="block text-sm font-semibold text-zinc-700 mb-1.5">Assign to Office *</label>
              {offices.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
                  No offices available. <Link href="/dashboard/office-management" className="font-bold underline">Create an office</Link> first.
                </div>
              ) : (
                <CustomSelect
                  value={formData.companyId || ""}
                  onChange={(value) => setFormData({ ...formData, companyId: value })}
                  options={offices.map((office: any) => ({
                    value: office.id.toString(),
                    label: office.name
                  }))}
                  placeholder="Select an Office"
                />
              )}
            </div>
          )}

          {formData.role === "AGENT" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label htmlFor="managerId" className="block text-sm font-semibold text-zinc-700 mb-1.5">Assign to Manager *</label>
              {managersList.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
                  No managers available. Create a manager first.
                </div>
              ) : (
                <CustomSelect
                  value={formData.managerId || ""}
                  onChange={(value) => setFormData({ ...formData, managerId: value })}
                  options={managersList.map((manager: any) => ({
                    value: manager.id.toString(),
                    label: `${manager.name} (${manager.company?.name || "No Office"})`
                  }))}
                  placeholder="Select a Manager"
                />
              )}
            </div>
          )}

          {formData.role === "MANAGER" && (
            <div className="animate-in slide-in-from-top-2 duration-300 delay-75 fill-mode-both">
              <label htmlFor="agentLimit" className="block text-sm font-semibold text-zinc-700 mb-1.5">Agent Limit</label>
              <input 
                id="agentLimit"
                type="number" 
                min="0"
                value={formData.agentLimit}
                onChange={(e) => setFormData({ ...formData, agentLimit: e.target.value })}
                placeholder="Leave blank for unlimited"
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditMode ? "Save Changes" : "Create User")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
