interface CloseDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CloseDayModal({ isOpen, onClose, onConfirm }: CloseDayModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] w-full max-w-[420px] shadow-2xl p-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        
        <div className="w-14 h-14 bg-[#fff8e6] rounded-full flex items-center justify-center mb-5">
          <div className="w-8 h-8 rounded-full bg-[#ffcc00] flex items-center justify-center text-white font-bold text-lg">
            !
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight">Close Day and Email Report?</h2>
        
        <div className="text-center space-y-4 mb-8">
          <p className="text-zinc-600 text-[13px] leading-relaxed px-2">
            This will finalize today&apos;s totals, generate the spreadsheet report, email it to 3 recipients, save a copy in Report History, and reset the board to zero for the next workday.
          </p>
          <p className="text-[#d62828] text-[12px] font-semibold leading-relaxed px-4">
            This action cannot be undone. Historical totals will remain available in Reports, but today&apos;s live board will reset immediately.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full gap-3">
          <button 
            onClick={onConfirm}
            className="w-full sm:flex-[1.5] cursor-pointer px-4 py-3 bg-[#e11d48] hover:bg-[#be123c] text-white text-[13px] font-bold rounded-xl transition-colors shadow-sm"
          >
            Yes, Close Day
          </button>
          <button 
            onClick={onClose}
            className="w-full sm:flex-1 cursor-pointer px-4 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[13px] font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
        
      </div>
    </div>
  );
}
