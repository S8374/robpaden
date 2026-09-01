"use client";

import React, { useState, useMemo } from "react";
import { UserPlus, Search, Users, Filter } from "lucide-react";
import { useUserManagement } from "../manager-management/_hooks/useUserManagement";
import { UserFormModal } from "../manager-management/_components/modals/UserFormModal";
import { DeleteUserModal } from "../manager-management/_components/modals/DeleteUserModal";
import { AgentsTable } from "./AgentsTable";

export default function AgentManagementPage() {
  const { state, actions } = useUserManagement();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("ALL");
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>("ALL");

  // Filter agents based on role, search, manager, and office
  const filteredAgents = useMemo(() => {
    return state.users.filter((user: any) => {
      if (user.role !== "AGENT") return false;
      
      const matchesSearch = searchQuery === "" || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesManager = selectedManagerId === "ALL" || user.managerId === parseInt(selectedManagerId);
      
      // An agent's office is typically derived from their manager's office
      const userOfficeId = user.company?.id || user.manager?.company?.id;
      const matchesOffice = selectedOfficeId === "ALL" || userOfficeId === parseInt(selectedOfficeId);

      return matchesSearch && matchesManager && matchesOffice;
    });
  }, [state.users, searchQuery, selectedManagerId, selectedOfficeId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Agent Management</h1>
          <p className="text-sm text-zinc-500 mt-1">View and manage all agents across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              actions.openCreateModal();
              actions.setFormData(prev => ({ ...prev, role: "AGENT" }));
            }}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Create Agent
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm flex-1 flex flex-col">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents..." 
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <select 
                  value={selectedManagerId}
                  onChange={(e) => {
                    const newManagerId = e.target.value;
                    setSelectedManagerId(newManagerId);
                    if (newManagerId !== "ALL") {
                      const manager = state.managersList.find((m: any) => m.id.toString() === newManagerId);
                      if (manager?.companyId) {
                        setSelectedOfficeId(manager.companyId.toString());
                      }
                    } else {
                      setSelectedOfficeId("ALL");
                    }
                  }}
                  className="pl-9 pr-10 py-2 w-40 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-zinc-300 cursor-pointer text-zinc-700 font-medium appearance-none transition-all"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a1a1aa\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                >
                  <option value="ALL">All Managers</option>
                  {state.managersList.map((manager: any) => (
                    <option key={manager.id} value={manager.id.toString()}>{manager.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <select 
                  value={selectedOfficeId}
                  onChange={(e) => setSelectedOfficeId(e.target.value)}
                  className="pl-9 pr-10 py-2 w-40 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-zinc-300 cursor-pointer text-zinc-700 font-medium appearance-none transition-all"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a1a1aa\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                >
                  <option value="ALL">All Offices</option>
                  {state.offices.map((office: any) => (
                    <option key={office.id} value={office.id.toString()}>{office.name}</option>
                  ))}
                </select>
              </div>

              <div className="hidden lg:flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg text-sm font-semibold border border-indigo-100 ml-2 shadow-sm">
                <Users className="w-4 h-4" />
                {filteredAgents.length} Agents
              </div>
            </div>
          </div>
        </div>

        <AgentsTable 
          users={filteredAgents}
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
        fixedRole="AGENT"
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
        fixedRole="AGENT"
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
