import React from "react";
import Link from "next/link";
import { X, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

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
          {isEditMode && (
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 mb-1.5">Full Name *</label>
              <input 
                id="name"
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                autoFocus
              />
            </div>
          )}

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
              <select 
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value, companyId: "", managerId: "" })}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
              >
                <option value="MANAGER">Manager</option>
                <option value="AGENT">Agent</option>
              </select>
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
                <select 
                  id="companyId"
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                >
                  <option value="" disabled>Select an Office</option>
                  {offices.map((office: any) => (
                    <option key={office.id} value={office.id}>{office.name}</option>
                  ))}
                </select>
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
                <select 
                  id="managerId"
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                >
                  <option value="" disabled>Select a Manager</option>
                  {managersList.map((manager: any) => (
                    <option key={manager.id} value={manager.id}>{manager.name} ({manager.company?.name || "No Office"})</option>
                  ))}
                </select>
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
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditMode ? "Save Changes" : "Create User")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
