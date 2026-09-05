import { X, Loader2 } from "lucide-react";

interface AddSaleModalProps {
  selectedAgent: { id: number; name: string; initials: string } | null;
  saleCount: number;
  isAdding: boolean;
  setSaleCount: (count: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function AddSaleModal({
  selectedAgent,
  saleCount,
  isAdding,
  setSaleCount,
  onConfirm,
  onClose,
}: AddSaleModalProps) {
  if (!selectedAgent) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 text-base">
            Add Sale — {selectedAgent.name}
          </h3>
          <button 
            onClick={() => !isAdding && onClose()} 
            disabled={isAdding} 
            className="text-zinc-400 cursor-pointer hover:text-zinc-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
              <button 
                onClick={() => setSaleCount(Math.max(1, saleCount - 1))} 
                disabled={isAdding} 
                className="w-10 cursor-pointer h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors font-bold text-lg disabled:opacity-50"
              >
                -
              </button>
              <div className="w-12 h-10 flex items-center justify-center bg-white border-x border-zinc-200 font-bold text-zinc-900">
                {saleCount}
              </div>
              <button 
                onClick={() => setSaleCount(saleCount + 1)} 
                disabled={isAdding} 
                className="w-10 cursor-pointer h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors font-bold text-lg disabled:opacity-50"
              >
                +
              </button>
            </div>
            <span className="text-sm font-medium text-zinc-600">sale(s)</span>
          </div>
          
          <p className="text-sm text-zinc-500 leading-relaxed mb-6">
            Will be recorded under {selectedAgent.name} at the current time.
          </p>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onConfirm} 
              disabled={isAdding} 
              className="flex-1 cursor-pointer flex justify-center items-center gap-2 bg-[#5252ff] hover:bg-[#4242e5] disabled:bg-[#5252ff]/70 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm"
            >
              {isAdding ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : "Confirm"}
            </button>
            <button 
              onClick={onClose} 
              disabled={isAdding} 
              className="flex-1 cursor-pointer bg-white border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white text-zinc-700 font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
