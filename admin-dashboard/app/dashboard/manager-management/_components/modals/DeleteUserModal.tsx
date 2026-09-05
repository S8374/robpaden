import React from "react";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean;
  selectedUser: any;
  isDeleting: boolean;
  errorMsg: string;
  handleDeleteUser: () => void;
  closeModal: () => void;
}

export function DeleteUserModal({
  isOpen,
  selectedUser,
  isDeleting,
  errorMsg,
  handleDeleteUser,
  closeModal,
}: DeleteUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 mb-2">Delete User?</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
        </p>
        {errorMsg && (
            <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium text-left">
              {errorMsg}
            </div>
        )}
        <div className="flex gap-3 justify-center">
          <button 
            onClick={closeModal}
            className="px-4 py-2 flex-1 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleDeleteUser}
            disabled={isDeleting}
            className="px-4 py-2 flex-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
