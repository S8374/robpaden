import { useState } from "react";
import { X, CalendarDays } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CustomDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
}

export function CustomDateRangeModal({ isOpen, onClose, onApply }: CustomDateRangeModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    if (startDate && endDate) {
      // Convert to local YYYY-MM-DD to pass to parent
      const s = startDate.toLocaleDateString('en-CA'); // 'en-CA' outputs YYYY-MM-DD
      const e = endDate.toLocaleDateString('en-CA');
      onApply(s, e);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[420px] shadow-xl animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3 text-zinc-900">
            <CalendarDays className="w-5 h-5 text-[#5252ff]" />
            <h2 className="font-bold text-lg tracking-tight">Select Custom Range</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 cursor-pointer text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 pb-6 space-y-6">
          <p className="text-[13px] text-zinc-500 leading-relaxed -mt-2">
            Choose a start and end date to filter the report data.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Start Date</label>
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  selectsStart
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  maxDate={endDate || new Date()}
                  placeholderText="Select start date"
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all"
                  wrapperClassName="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">End Date</label>
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  minDate={startDate || undefined}
                  maxDate={new Date()}
                  placeholderText="Select end date"
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all"
                  wrapperClassName="w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex w-full gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 cursor-pointer px-4 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[13px] font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              disabled={!startDate || !endDate}
              className="flex-[1.5] cursor-pointer px-4 py-3 bg-[#5252ff] hover:bg-[#4242e5] disabled:bg-[#5252ff]/50 disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-xl transition-colors shadow-sm"
            >
              Apply Filter
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
