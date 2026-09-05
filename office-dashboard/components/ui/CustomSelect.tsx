"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  icon,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10 pointer-events-none">
          {icon}
        </div>
      )}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full py-2 border border-zinc-200 bg-white text-sm focus:outline-none hover:border-zinc-300 transition-all cursor-pointer flex justify-between items-center ${icon ? 'pl-9 pr-3' : 'px-3'} ${disabled ? 'opacity-50 cursor-not-allowed bg-zinc-50' : 'focus:ring-2 focus:ring-primary/20'} rounded-lg`}
      >
        <span className={`truncate font-medium ${selectedOption ? 'text-zinc-700' : 'text-zinc-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full min-w-max bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto custom-scrollbar">
          <div className="p-1 flex flex-col gap-0.5">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  value === option.value ? 'bg-zinc-100' : 'hover:bg-zinc-50'
                }`}
              >
                <span className={`text-sm ${value === option.value ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'}`}>
                  {option.label}
                </span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-zinc-900 ml-3 shrink-0" />
                )}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-2 text-sm text-zinc-500 text-center">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
