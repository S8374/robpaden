import { useState } from "react";
import { toast } from "sonner";
import { X, Mail } from "lucide-react";
import { useAddRecipientMutation, useRemoveRecipientMutation } from "@/redux/api/report.api";

interface EmailRecipientsBlockProps {
  isLoading?: boolean;
  recipients?: any[];
}

export function EmailRecipientsBlock({ isLoading, recipients }: EmailRecipientsBlockProps) {
  const data = recipients || [];
  const [inputValue, setInputValue] = useState("");
  const [addRecipient, { isLoading: isAdding }] = useAddRecipientMutation();
  const [removeRecipient, { isLoading: isRemoving }] = useRemoveRecipientMutation();

  const handleAdd = async () => {
    if (!inputValue.trim() || !inputValue.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      await addRecipient(inputValue.trim()).unwrap();
      toast.success("Email added to recipients");
      setInputValue("");
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to add email");
    }
  };

  const handleRemove = async (email: string) => {
    try {
      await removeRecipient(email).unwrap();
      toast.success("Email removed");
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to remove email");
    }
  };

  return (
    <div className="mb-12">
      <h3 className="text-[15px] font-bold text-zinc-900 tracking-tight mb-4">Email Recipients</h3>
      
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
        {/* Recipients Pills */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
          {isLoading ? (
            <div className="flex gap-2">
              <div className="w-32 h-8 bg-zinc-100 rounded-md animate-pulse"></div>
              <div className="w-24 h-8 bg-zinc-100 rounded-md animate-pulse"></div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-[13px] text-zinc-400 flex items-center h-8">No recipients configured.</div>
          ) : (
            data.map((recipient) => (
              <div 
                key={recipient.id} 
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-md text-[13px] font-medium"
              >
                {recipient.email}
                <button 
                  onClick={() => handleRemove(recipient.email)}
                  disabled={isRemoving}
                  className="text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center border border-zinc-200 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#5252ff]/20 focus-within:border-[#5252ff] transition-all">
            <input 
              type="email"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add recipient email..."
              disabled={isAdding}
              className="flex-1 outline-none text-[13px] text-zinc-900 placeholder:text-zinc-400 bg-transparent"
            />
            <Mail className="w-4 h-4 text-emerald-500 ml-2 shrink-0" />
          </div>
          <button 
            onClick={handleAdd}
            disabled={isAdding}
            className="bg-[#5252ff] hover:bg-[#4242e5] text-white px-6 py-2.5 rounded-lg text-[13px] font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {isAdding ? "..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
