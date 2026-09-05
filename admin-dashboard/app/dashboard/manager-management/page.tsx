"use client";

import { UserPlus, Search } from "lucide-react";
import { useUserManagement } from "./_hooks/useUserManagement";
import { UserFormModal } from "./_components/modals/UserFormModal";
import { DeleteUserModal } from "./_components/modals/DeleteUserModal";
import { UsersTable } from "./_components/tables/UsersTable";

export default function UsersPage() {
  const { state, actions } = useUserManagement();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Manager Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage managers and their access across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={actions.openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Create Manager
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
         
        </div>

        <UsersTable 
          users={state.users.filter((user: any) => user.role === "MANAGER")}
          isLoading={state.isLoading}
          isFetching={state.isFetching}
          openActionMenuId={state.openActionMenuId}
          setOpenActionMenuId={actions.setOpenActionMenuId}
          isToggling={state.isToggling}
          handleToggleStatus={actions.handleToggleStatus}
          openEditModal={actions.openEditModal}
          setSelectedUser={actions.setSelectedUser}
          setIsDeleteModalOpen={actions.setIsDeleteModalOpen}
        />
      </div>

      <UserFormModal 
        isOpen={state.isModalOpen}
        isEditMode={false}
        formData={state.formData}
        setFormData={actions.setFormData}
        errorMsg={state.errorMsg}
        successMsg={state.successMsg}
        showPassword={state.showPassword}
        setShowPassword={actions.setShowPassword}
        isSubmitting={state.isCreating}
        handleSubmit={actions.handleCreateUser}
        closeModal={() => actions.setIsModalOpen(false)}
        offices={state.offices}
        managersList={state.managersList}
        fixedRole="MANAGER"
      />

      <UserFormModal 
        isOpen={state.isEditModalOpen}
        isEditMode={true}
        formData={state.formData}
        setFormData={actions.setFormData}
        errorMsg={state.errorMsg}
        successMsg={state.successMsg}
        showPassword={state.showPassword}
        setShowPassword={actions.setShowPassword}
        isSubmitting={state.isUpdating}
        handleSubmit={actions.handleUpdateUser}
        closeModal={() => actions.setIsEditModalOpen(false)}
        offices={state.offices}
        managersList={state.managersList}
        fixedRole="MANAGER"
      />

      <DeleteUserModal 
        isOpen={state.isDeleteModalOpen}
        selectedUser={state.selectedUser}
        isDeleting={state.isDeleting}
        errorMsg={state.errorMsg}
        handleDeleteUser={actions.handleDeleteUser}
        closeModal={() => actions.setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
