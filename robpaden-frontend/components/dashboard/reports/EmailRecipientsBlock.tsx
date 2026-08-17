import { useState } from "react";
import { X } from "lucide-react";

export function EmailRecipientsBlock({ isLoading }: { isLoading?: boolean }) {
  const [emails, setEmails] = useState<string[]>([
    "rob@officea.com",
    "ops@officea.com",
    "manager2@officea.com",
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !emails.includes(trimmed)) {
      setEmails([...emails, trimmed]);
      setInputValue("");
    }
  };

  const handleRemove = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-[15px] font-bold text-zinc-900 mb-4 tracking-tight">Email Recipients</h3>
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 flex flex-col gap-4">
        
        {/* Pills Container */}
        {isLoading ? (
          <div className="flex flex-wrap gap-2 animate-pulse">
            <div className="w-32 h-8 bg-zinc-100 rounded-md"></div>
            <div className="w-32 h-8 bg-zinc-100 rounded-md"></div>
            <div className="w-40 h-8 bg-zinc-100 rounded-md"></div>
          </div>
        ) : emails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {emails.map((email) => (
              <div 
                key={email} 
                className="flex items-center gap-1.5 bg-[#f4f4f5] text-zinc-700 px-3 py-1.5 rounded-md text-[13px] font-medium"
              >
                {email}
                <button 
                  onClick={() => handleRemove(email)}
                  className="text-zinc-400 cursor-pointer hover:text-zinc-600 focus:outline-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {isLoading ? (
            <>
              <div className="flex-1 h-10 bg-zinc-100 rounded-lg animate-pulse"></div>
              <div className="w-20 h-10 bg-zinc-100 rounded-lg animate-pulse"></div>
            </>
          ) : (
            <>
              <input 
                type="email"
                placeholder="Add recipient email..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all"
              />
              <button 
                onClick={handleAdd}
                className="bg-[#5252ff] cursor-pointer hover:bg-[#4242e5] text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                Add
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
