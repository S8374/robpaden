import { Loader2, AlertCircle } from "lucide-react";

interface ReverseSaleModalProps {
  reverseSale: any;
  correctAgent: { id: number; name: string; initials: string; today: number } | null;
  isProcessing: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ReverseSaleModal({
  reverseSale,
  correctAgent,
  isProcessing,
  onConfirm,
  onClose,
}: ReverseSaleModalProps) {
  if (!reverseSale || !correctAgent) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-6 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-zinc-900 text-lg mb-4">Reverse this sale?</h3>
          
          <div className="w-full bg-zinc-50 rounded-lg p-3 text-left mb-4 border border-zinc-100">
            <p className="font-semibold text-zinc-800 text-sm">
              {reverseSale.count} {reverseSale.count === 1 ? 'sale' : 'sales'} • {correctAgent.name} • {reverseSale.time}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Originally entered by {reverseSale.by}</p>
          </div>

          <p className="text-sm text-zinc-500 leading-relaxed mb-6 text-left w-full">
            This will remove the sale from {correctAgent.name}'s daily and weekly totals and update the leaderboard immediately. The TV board will not replay the BOOM animation.
          </p>

          <div className="flex items-center gap-3 w-full">
            <button 
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 flex justify-center items-center gap-2 bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-[#ef4444]/70 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm cursor-pointer"
            >
              {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Reversing...</> : "Yes, Reverse Sale"}
            </button>
            <button 
              onClick={() => !isProcessing && onClose()}
              disabled={isProcessing}
              className="flex-none px-6 bg-white hover:bg-zinc-50 text-zinc-600 font-semibold py-2.5 rounded-lg transition-colors text-sm cursor-pointer border border-zinc-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
