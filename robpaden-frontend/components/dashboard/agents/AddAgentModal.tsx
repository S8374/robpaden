import { useState } from "react";
import { X, UserPlus } from "lucide-react";
// import { useAddAgentMutation, useUploadFileMutation } from "@/redux/api/agent.api";

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAgentModal({ isOpen, onClose }: AddAgentModalProps) {
  /* --- ORIGINAL BACKEND LOGIC COMMENTED OUT FOR DEMO ---
  const [addAgent, { isLoading }] = useAddAgentMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { ... }
  const handleSubmit = async (e: React.FormEvent) => { ... }
  --------------------------------------------------------- */

  const [formData, setFormData] = useState({
    name: "",
    role: "Sales Representative",
    dailyGoal: "",
    weeklyGoal: "",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3 text-zinc-900">
            <UserPlus className="w-5 h-5 text-[#5252ff]" />
            <h2 className="font-bold text-lg tracking-tight">Add New Sales Agent</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <p className="text-[13px] text-zinc-500 leading-relaxed -mt-2 pr-4">
            Provide agent profile details, assign to office, and individual target goals.
          </p>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2 uppercase tracking-wider">Agent Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#f0f4ff] text-[#5252ff] flex items-center justify-center font-bold text-xl shrink-0">
                JM
              </div>
              <button className="text-[#5252ff] cursor-pointer hover:text-[#4242e5] font-semibold text-sm transition-colors">
                Upload Photo
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2 uppercase tracking-wider">Presets</label>
            <div className="flex items-center gap-2">
              {['AB', 'CD', 'EF', 'JH', 'GH', 'IJ'].map((preset, i) => (
                <div 
                  key={preset} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer transition-colors ${
                    preset === 'JH' 
                      ? 'bg-[#5252ff] text-white ring-2 ring-[#5252ff] ring-offset-2' 
                      : 'bg-white text-[#5252ff] border border-[#5252ff]/20 hover:bg-[#f0f4ff]'
                  }`}
                >
                  {preset}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Agent Full Name</label>
              <input
                type="text"
                placeholder="e.g. Jordan Miller"
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
               <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Role Title</label>
               <input
                 type="text"
                 placeholder="Sales Representative"
                 className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all"
                 value={formData.role}
                 onChange={(e) => setFormData({ ...formData, role: e.target.value })}
               />
            </div>
            
            <div className="flex gap-4">
               <div className="flex-1">
                 <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Daily Goal (Deals)</label>
                 <input 
                   type="number" 
                   min="0"
                   placeholder="e.g. 5" 
                   value={formData.dailyGoal}
                   onChange={(e) => setFormData({ ...formData, dailyGoal: e.target.value })}
                   className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all" 
                 />
               </div>
               <div className="flex-1">
                 <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Weekly Goal (Deals)</label>
                 <input 
                   type="number" 
                   min="0"
                   placeholder="e.g. 25" 
                   value={formData.weeklyGoal}
                   onChange={(e) => setFormData({ ...formData, weeklyGoal: e.target.value })}
                   className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all" 
                 />
               </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              onClick={onClose}
              className="text-[#5252ff] cursor-pointer hover:text-[#4242e5] font-semibold text-sm px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
              }}
              className="bg-[#5252ff] cursor-pointer hover:bg-[#4242e5] text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              Add Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
