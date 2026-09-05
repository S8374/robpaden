import { Loader2 } from "lucide-react";

interface EditSaleModalProps {
  editSale: any;
  correctAgent: { id: number; name: string; initials: string; today: number } | null;
  editCount: number;
  isProcessing: boolean;
  setEditCount: (count: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function EditSaleModal({
  editSale,
  correctAgent,
  editCount,
  isProcessing,
  setEditCount,
  onConfirm,
  onClose,
}: EditSaleModalProps) {
  if (!editSale || !correctAgent) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[420px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-900 text-base">Edit Sale Count</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {correctAgent.name} • originally entered at {editSale.time} by {editSale.by}
          </p>
        </div>
        
        <div className="px-6 py-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
              <button 
                onClick={() => setEditCount(Math.max(1, editCount - 1))}
                disabled={isProcessing}
                className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors font-bold text-lg disabled:opacity-50 cursor-pointer"
              >
                -
              </button>
              <div className="w-12 h-10 flex items-center justify-center bg-white border-x border-zinc-200 font-bold text-zinc-900">
                {editCount}
              </div>
              <button 
                onClick={() => setEditCount(editCount + 1)}
                disabled={isProcessing}
                className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors font-bold text-lg disabled:opacity-50 cursor-pointer"
              >
                +
              </button>
            </div>
            <span className="text-sm font-medium text-zinc-600">sale(s) (was {editSale.count})</span>
          </div>
          
          {editCount !== editSale.count && (
            <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-100 mb-6 leading-relaxed">
              This {editCount > editSale.count ? 'adds' : 'removes'} {Math.abs(editCount - editSale.count)} sale{Math.abs(editCount - editSale.count) > 1 ? 's' : ''} from {correctAgent.name}'s daily and weekly totals. The leaderboard updates immediately; no BOOM replays.
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onConfirm}
              disabled={isProcessing || editCount === editSale.count}
              className="flex-1 flex justify-center items-center gap-2 bg-[#5252ff] hover:bg-[#4242e5] disabled:bg-[#5252ff]/50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm cursor-pointer"
            >
              {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Change"}
            </button>
            <button 
              onClick={() => !isProcessing && onClose()}
              disabled={isProcessing}
              className="flex-none px-6 bg-white hover:bg-zinc-50 text-zinc-600 font-semibold py-2.5 rounded-lg transition-colors text-sm border border-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
