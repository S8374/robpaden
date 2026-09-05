import { X, Download } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function ExportModal({ isOpen, onClose, onDownload }: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[420px] shadow-xl animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3 text-zinc-900">
            <Download className="w-5 h-5 text-[#5252ff]" />
            <h2 className="font-bold text-lg tracking-tight">Export Report</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 cursor-pointer text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 pb-6 space-y-6">
          <p className="text-[13px] text-zinc-500 leading-relaxed -mt-2 pr-4">
            Are you sure you want to download this report data as a CSV file?
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={() => {
                onClose();
                onDownload();
              }}
              className="w-full cursor-pointer flex justify-center items-center gap-2 px-4 py-3 bg-[#5252ff] hover:bg-[#4242e5] text-white text-[13px] font-bold rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Yes, Download CSV
            </button>
            <button 
              onClick={onClose}
              className="w-full cursor-pointer px-4 py-3 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 text-[13px] font-bold rounded-xl transition-colors mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
