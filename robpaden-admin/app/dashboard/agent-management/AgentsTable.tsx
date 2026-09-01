import React from "react";
import Link from "next/link";
import { Shield, MoreVertical, Lock, Unlock, Edit, Trash2 } from "lucide-react";

interface UsersTableProps {
  users: any[];
  isLoading: boolean;
  isFetching: boolean;
  openActionMenuId: number | null;
  setOpenActionMenuId: (id: number | null) => void;
  isToggling: boolean;
  handleToggleStatus: (user: any) => void;
  openEditModal: (user: any) => void;
  setSelectedUser: (user: any) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
}

export function AgentsTable({
  users,
  isLoading,
  isFetching,
  openActionMenuId,
  setOpenActionMenuId,
  isToggling,
  handleToggleStatus,
  openEditModal,
  setSelectedUser,
  setIsDeleteModalOpen,
}: UsersTableProps) {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="overflow-x-auto relative">
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="bg-zinc-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            {toastMessage}
          </div>
        </div>
      )}
      <table className="w-full text-sm text-left">
        <thead className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50/50">
          <tr>
            <th className="px-6 py-4 tracking-wider border-b border-zinc-100">Agent Info</th>
            <th className="px-4 py-4 tracking-wider border-b border-zinc-100">Assigned Manager</th>
            <th className="px-4 py-4 tracking-wider border-b border-zinc-100">Assigned Office</th>
            <th className="px-4 py-4 tracking-wider border-b border-zinc-100">Password</th>
            <th className="px-4 py-4 tracking-wider text-center border-b border-zinc-100">Status</th>
            <th className="px-6 py-4 tracking-wider text-right border-b border-zinc-100">Joined</th>
            <th className="px-4 py-4 tracking-wider text-right border-b border-zinc-100">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {isLoading || isFetching ? (
            Array.from({ length: Math.max(users.length, 5) }).map((_, idx) => (
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
                  {user.manager ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                        {user.manager.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-900">{user.manager.name}</p>
                        <p className="text-[10px] text-zinc-500">{user.manager.email}</p>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => openEditModal(user)} className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors cursor-pointer inline-flex items-center gap-1">
                      + Assign Manager
                    </button>
                  )}
                </td>
                <td className="px-4 py-4">
                   <span className="font-medium text-zinc-700 text-xs">
                     {user.manager?.company?.name || <span className="text-zinc-400 italic">No Office</span>}
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
                      href={`/dashboard/manager-management/${user.id}`}
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
                              onClick={() => { setOpenActionMenuId(null); showToast("Coming soon"); }}
                              className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-amber-600 flex items-center gap-2 cursor-pointer"
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
  );
}
