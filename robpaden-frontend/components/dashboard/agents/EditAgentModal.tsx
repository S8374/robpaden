import { useState, useEffect } from "react";
import { X, UserCog } from "lucide-react";
import { useRef } from "react";
import { useUpdateAgentMutation, useUploadFileMutation } from "@/redux/api/agent.api";

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: any;
}

export function EditAgentModal({ isOpen, onClose, agent }: EditAgentModalProps) {
  const [updateAgent, { isLoading: isUpdating }] = useUpdateAgentMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dailyGoal: "",
    weeklyGoal: "",
    monthlyGoal: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (agent) {
      setFormData({ 
        name: agent.name || "",
        email: agent.email || "",
        password: agent.password || "",
        dailyGoal: agent.dailyGoal !== null && agent.dailyGoal !== undefined ? String(agent.dailyGoal) : "",
        weeklyGoal: agent.weeklyGoal !== null && agent.weeklyGoal !== undefined ? String(agent.weeklyGoal) : "",
        monthlyGoal: agent.monthlyGoal !== null && agent.monthlyGoal !== undefined ? String(agent.monthlyGoal) : "",
        avatarUrl: agent.avatarUrl || "",
      });
    }
  }, [agent]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      try {
        const res = await uploadFile(formDataUpload).unwrap();
        if (res.data?.url) {
          setFormData(prev => ({ ...prev, avatarUrl: res.data.url }));
        }
      } catch (err) {
        console.error("Upload failed", err);
        alert("Failed to upload photo");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        dailyGoal: formData.dailyGoal ? parseInt(formData.dailyGoal, 10) : undefined,
        weeklyGoal: formData.weeklyGoal ? parseInt(formData.weeklyGoal, 10) : undefined,
        monthlyGoal: formData.monthlyGoal ? parseInt(formData.monthlyGoal, 10) : undefined,
        avatarUrl: formData.avatarUrl,
      };
      await updateAgent({ id: agent.id, data: payload }).unwrap();
      onClose();
    } catch (err: any) {
      console.error("Failed to update agent", err);
      alert(err?.data?.error?.message || "Failed to update agent");
    }
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3 text-zinc-900">
            <UserCog className="w-5 h-5 text-[#5252ff]" />
            <h2 className="font-bold text-lg tracking-tight">Edit Agent Profile</h2>
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
            Update agent profile details, reassign office, and adjust individual target goals.
          </p>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2 uppercase tracking-wider">Agent Photo</label>
            <div className="flex items-center gap-4">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover shrink-0 border border-zinc-200" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#f0f4ff] text-[#5252ff] flex items-center justify-center font-bold text-xl shrink-0">
                  {formData.name ? formData.name.substring(0, 2).toUpperCase() : "A"}
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-[#5252ff] cursor-pointer hover:text-[#4242e5] font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Upload Photo"}
              </button>
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
               <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Email Address</label>
               <input
                 type="email"
                 placeholder="agent@example.com"
                 className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all"
                 value={formData.email}
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 required
               />
            </div>

            <div>
               <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Password</label>
               <input
                 type="text"
                 placeholder="Leave blank to keep unchanged"
                 className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5252ff]/20 focus:border-[#5252ff] transition-all"
                 value={formData.password}
                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
               />
            </div><div className="flex gap-4">
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
               <div className="flex-1">
                 <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Monthly Goal</label>
                 <input 
                   type="number" 
                   min="0"
                   placeholder="e.g. 100" 
                   value={formData.monthlyGoal}
                   onChange={(e) => setFormData({ ...formData, monthlyGoal: e.target.value })}
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
              onClick={handleSubmit}
              disabled={isUpdating || isUploading}
              className="bg-[#5252ff] cursor-pointer hover:bg-[#4242e5] text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
