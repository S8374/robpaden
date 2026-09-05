import { NotificationBell } from "./NotificationBell";
import { Menu, CalendarDays } from "lucide-react";
import React, { forwardRef } from "react";
import { useSidebar } from "./SidebarContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setSelectedDate } from "@/redux/features/dateSlice";

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
  dateLabel?: string;
}

const CustomDateInput = forwardRef<HTMLInputElement, any>(
  ({ value, onClick, dateLabel, className }, ref) => (
    <input
      type="text"
      value={dateLabel || value}
      onClick={onClick}
      ref={ref}
      className={className}
      readOnly
    />
  )
);
CustomDateInput.displayName = "CustomDateInput";

export function Header({ title, action, dateLabel }: HeaderProps) {
  const { setIsOpen } = useSidebar();
  const dispatch = useDispatch();
  const selectedDateStr = useSelector((state: RootState) => state.date.selectedDate);

  return (
    <div className="flex-none px-4 md:px-8 py-4 flex items-center justify-between border-b border-zinc-200 bg-white">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsOpen(true)}
          className="xl:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex items-center bg-white border border-zinc-200 rounded-lg group hover:border-[#5252ff]/50 transition-colors z-[100]">
          <div className="pl-3 pr-2 text-zinc-400 group-hover:text-[#5252ff] transition-colors">
            <CalendarDays className="w-4 h-4" />
          </div>
          <DatePicker
            selected={new Date(selectedDateStr)}
            onChange={(date: Date | null) => {
              if (date) {
                dispatch(setSelectedDate(date.toISOString()));
              }
            }}
            maxDate={new Date()}
            dateFormat="MMM d, yyyy"
            customInput={
              <CustomDateInput 
                dateLabel={dateLabel}
                className="w-40 py-2 text-sm text-zinc-700 focus:outline-none cursor-pointer bg-transparent"
              />
            }
            className="w-32 py-2 text-sm text-zinc-700 focus:outline-none cursor-pointer bg-transparent"
            popperClassName="z-[100]"
          />
        </div>
        {action && (
          <div className="flex items-center">
            {action}
          </div>
        )}
        <NotificationBell />
      </div>
    </div>
  );
}
