"use client";

import Link from "next/link";
import { Users, Plus, Search, Loader2, UserPlus, Shield, X, CheckCircle2, Eye, EyeOff, Edit, Trash2, Lock, Unlock, FileText, MoreVertical } from "lucide-react";
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation, useToggleUserStatusMutation } from "@/redux/api/user.api";
import { useGetOfficesQuery } from "@/redux/api/office.api";
import { useState } from "react";

export default function UsersPage() {
  const { data: usersData, isLoading, isFetching } = useGetUsersQuery();
  const { data: officesData } = useGetOfficesQuery();
  
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "MANAGER",
    companyId: "",
    managerId: "",
    agentLimit: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const users = usersData?.data || [];
  const offices = officesData?.data || [];
  const managersList = users.filter((u: any) => u.role === "MANAGER");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!formData.email || !formData.password || !formData.role) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    
    if (formData.role === "MANAGER" && !formData.companyId) {
      setErrorMsg("A Manager must be assigned to an office.");
      return;
    }
    
    if (formData.role === "AGENT" && !formData.managerId) {
      setErrorMsg("An Agent must be assigned to a Manager.");
      return;
    }
    
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      
      if (formData.role === "MANAGER" && formData.companyId) {
        payload.companyId = parseInt(formData.companyId);
        if (formData.agentLimit) {
          payload.agentLimit = parseInt(formData.agentLimit);
        }
      }
      
      if (formData.role === "AGENT" && formData.managerId) {
        payload.managerId = parseInt(formData.managerId);
        const selectedManager = managersList.find((m: any) => m.id === payload.managerId);
        if (selectedManager?.companyId) {
          payload.companyId = selectedManager.companyId;
        }
      }
      
      const res = await createUser(payload).unwrap();
      
      if (res.success) {
        setSuccessMsg("User created successfully!");
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "MANAGER",
          companyId: "",
          managerId: "",
          agentLimit: ""
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg("");
        }, 1500);
      } else {
        setErrorMsg(res.message || "Failed to create user.");
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.data?.error?.details?.issues?.[0]?.message || "Something went wrong.");
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "MANAGER",
      companyId: "",
      managerId: "",
      agentLimit: ""
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || "", // prefill decrypted password
      role: user.role,
      companyId: user.companyId ? String(user.companyId) : "",
      managerId: user.managerId ? String(user.managerId) : "",
      agentLimit: user.agentLimit ? String(user.agentLimit) : ""
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (formData.role === "AGENT" && !formData.managerId) {
      setErrorMsg("An Agent must be assigned to a Manager.");
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyId: formData.role === "MANAGER" && formData.companyId ? parseInt(formData.companyId) : null,
        agentLimit: formData.role === "MANAGER" && formData.agentLimit ? parseInt(formData.agentLimit) : null,
        managerId: formData.role === "AGENT" && formData.managerId ? parseInt(formData.managerId) : null
      };
      
      if (formData.role === "AGENT" && formData.managerId) {
        const selectedManager = managersList.find((m: any) => m.id === payload.managerId);
        if (selectedManager?.companyId) {
          payload.companyId = selectedManager.companyId;
        }
      }
      
      const res = await updateUser({ id: selectedUser.id, data: payload }).unwrap();
      if (res.success) {
        setIsEditModalOpen(false);
        setSelectedUser(null);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser.id).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to delete user");
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await toggleStatus({ id: user.id, isActive: !user.isActive }).unwrap();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">User Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage managers, agents, and their access across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={openCreateModal}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm flex-1 flex flex-col">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
             <button className="text-sm font-medium text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer">Filter Role</button>
          </div>
        </div>

        <div className="w-full">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50/50">
              <tr>
                <th className="px-6 py-4 tracking-wider border-b border-zinc-100">User Info</th>
                <th className="px-4 py-4 tracking-wider border-b border-zinc-100">Role</th>
                <th className="px-4 py-4 tracking-wider border-b border-zinc-100">Assigned Office</th>
                <th className="px-4 py-4 tracking-wider border-b border-zinc-100">Password</th>
                <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Status</th>
                <th className="px-6 py-4 tracking-wider text-right border-b border-zinc-100">Joined</th>
                <th className="px-4 py-4 tracking-wider text-right border-b border-zinc-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading || isFetching ? (
                Array.from({ length: users.length || 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-200/60"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-zinc-200/60 rounded"></div>
                          <div className="h-3 w-24 bg-zinc-100 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 w-20 bg-zinc-200/60 rounded-full"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-32 bg-zinc-200/60 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-zinc-200/60 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-16 bg-zinc-200/60 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 flex justify-end">
                      <div className="h-4 w-20 bg-zinc-200/60 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-8 w-8 bg-zinc-200/60 rounded mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    No users found. Create one to get started!
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                          {user.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{user.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                        user.role === 'SUPER_ADMIN' 
                          ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                          : user.role === 'MANAGER'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                       <span className="font-medium text-zinc-700">
                         {user.role === 'SUPER_ADMIN' ? 'All Access' : user.company?.name || user.manager?.company?.name || (
                           user.role === 'MANAGER' ? (
                             <button onClick={() => openEditModal(user)} className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors cursor-pointer inline-flex items-center gap-1">
                               + Assign Office
                             </button>
                           ) : (
                             <span className="text-zinc-400 italic">Unassigned</span>
                           )
                         )}
                       </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-600 border border-zinc-200">
                        {user.password || '••••••••'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {user.isActive ? 'Active' : 'Blocked'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      <div className={`flex items-center justify-end gap-3 relative ${openActionMenuId === user.id ? 'z-50' : 'z-0'}`}>
                        <Link 
                          href={`/dashboard/user-management/${user.id}`}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
                        >
                          See Details
                        </Link>
                        
                        <div className="relative">
                          <button 
                            onClick={() => setOpenActionMenuId(openActionMenuId === user.id ? null : user.id)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-5 h-5 pointer-events-none" />
                          </button>

                          {openActionMenuId === user.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setOpenActionMenuId(null)}
                              ></div>
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                                <button 
                                  onClick={() => { setOpenActionMenuId(null); handleToggleStatus(user); }}
                                  disabled={isToggling}
                                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-amber-600 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                                >
                                  {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                  {user.isActive ? 'Block' : 'Unblock'}
                                </button>
                                <button 
                                  onClick={() => { setOpenActionMenuId(null); openEditModal(user); }}
                                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <div className="border-t border-zinc-100 my-1"></div>
                                <button 
                                  onClick={() => { setOpenActionMenuId(null); setSelectedUser(user); setIsDeleteModalOpen(true); }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900">Create New User</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-5 flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 mb-1.5">Email Address *</label>
                <input 
                  id="email"
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. jane@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-zinc-700 mb-1.5">Role *</label>
                <select 
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, companyId: "", managerId: "" })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                >
                  <option value="MANAGER">Manager</option>
                  <option value="AGENT">Agent</option>
                </select>
              </div>

              {formData.role === "MANAGER" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label htmlFor="companyId" className="block text-sm font-semibold text-zinc-700 mb-1.5">Assign to Office *</label>
                  {offices.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
                      No offices available. <Link href="/dashboard/office-management" className="font-bold underline">Create an office</Link> first.
                    </div>
                  ) : (
                    <select 
                      id="companyId"
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                    >
                      <option value="" disabled>Select an Office</option>
                      {offices.map((office: any) => (
                        <option key={office.id} value={office.id}>{office.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {formData.role === "AGENT" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label htmlFor="managerId" className="block text-sm font-semibold text-zinc-700 mb-1.5">Assign to Manager *</label>
                  {managersList.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
                      No managers available. Create a manager first.
                    </div>
                  ) : (
                    <select 
                      id="managerId"
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                    >
                      <option value="" disabled>Select a Manager</option>
                      {managersList.map((manager: any) => (
                        <option key={manager.id} value={manager.id}>{manager.name} ({manager.company?.name || "No Office"})</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {formData.role === "MANAGER" && (
                <div className="animate-in slide-in-from-top-2 duration-300 delay-75 fill-mode-both">
                  <label htmlFor="agentLimit" className="block text-sm font-semibold text-zinc-700 mb-1.5">Agent Limit</label>
                  <input 
                    id="agentLimit"
                    type="number" 
                    min="0"
                    value={formData.agentLimit}
                    onChange={(e) => setFormData({ ...formData, agentLimit: e.target.value })}
                    placeholder="Leave blank for unlimited"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                  />
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
                  {errorMsg}
                </div>
              )}
              
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
              )}

              <div className="mt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900">Edit User</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-5 flex flex-col gap-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-semibold text-zinc-700 mb-1.5">Full Name *</label>
                <input 
                  id="edit-name"
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="edit-email" className="block text-sm font-semibold text-zinc-700 mb-1.5">Email Address *</label>
                <input 
                  id="edit-email"
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label htmlFor="edit-password" className="block text-sm font-semibold text-zinc-700 mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    id="edit-password"
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank to keep current password"
                    className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="edit-role" className="block text-sm font-semibold text-zinc-700 mb-1.5">Role *</label>
                <select 
                  id="edit-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, companyId: "", managerId: "" })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                >
                  <option value="MANAGER">Manager</option>
                  <option value="AGENT">Agent</option>
                </select>
              </div>

              {formData.role === "MANAGER" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label htmlFor="edit-companyId" className="block text-sm font-semibold text-zinc-700 mb-1.5">Assign to Office *</label>
                  {offices.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
                      No offices available. <Link href="/dashboard/office-management" className="font-bold underline">Create an office</Link> first.
                    </div>
                  ) : (
                    <select 
                      id="edit-companyId"
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                    >
                      <option value="" disabled>Select an Office</option>
                      {offices.map((office: any) => (
                        <option key={office.id} value={office.id}>{office.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {formData.role === "AGENT" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label htmlFor="edit-managerId" className="block text-sm font-semibold text-zinc-700 mb-1.5">Assign to Manager *</label>
                  {managersList.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
                      No managers available. Create a manager first.
                    </div>
                  ) : (
                    <select 
                      id="edit-managerId"
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                    >
                      <option value="" disabled>Select a Manager</option>
                      {managersList.map((manager: any) => (
                        <option key={manager.id} value={manager.id}>{manager.name} ({manager.company?.name || "No Office"})</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {formData.role === "MANAGER" && (
                <div className="animate-in slide-in-from-top-2 duration-300 delay-75 fill-mode-both">
                  <label htmlFor="edit-agentLimit" className="block text-sm font-semibold text-zinc-700 mb-1.5">Agent Limit</label>
                  <input 
                    id="edit-agentLimit"
                    type="number" 
                    min="0"
                    value={formData.agentLimit}
                    onChange={(e) => setFormData({ ...formData, agentLimit: e.target.value })}
                    placeholder="Leave blank for unlimited"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                  />
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
                  {errorMsg}
                </div>
              )}
              
              <div className="mt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mb-2">Delete User?</h2>
            <p className="text-sm text-zinc-500 mb-6">
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
            </p>
            {errorMsg && (
                <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium text-left">
                  {errorMsg}
                </div>
            )}
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 flex-1 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 flex-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
