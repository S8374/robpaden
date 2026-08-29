import React from "react";
import { Loader2 } from "lucide-react";

interface DeleteOfficeModalProps {
  officeToDelete: { id: number; name: string } | null;
  isDeleting: boolean;
  handleDeleteOffice: () => void;
  setOfficeToDelete: (office: { id: number; name: string } | null) => void;
}

export function DeleteOfficeModal({
  officeToDelete,
  isDeleting,
  handleDeleteOffice,
  setOfficeToDelete,
}: DeleteOfficeModalProps) {
  if (!officeToDelete) return null;

  return (
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
            className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete office"}
          </button>
          <button 
            onClick={() => setOfficeToDelete(null)}
            disabled={isDeleting}
            className="w-full bg-white hover:bg-zinc-50 text-zinc-700 font-medium py-2.5 border border-zinc-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
