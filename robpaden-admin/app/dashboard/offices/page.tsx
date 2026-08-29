"use client";

import { Plus } from "lucide-react";
import { useOffices } from "./_hooks/useOffices";
import { OfficeFormModal } from "./_components/modals/OfficeFormModal";
import { DeleteOfficeModal } from "./_components/modals/DeleteOfficeModal";
import { OfficesTable } from "./_components/tables/OfficesTable";

export default function OfficesPage() {
  const { state, data, actions } = useOffices();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Offices</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage onboarding, settings, and targets for all offices.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={actions.openCreateModal}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Office
          </button>
        </div>
      </div>

      <OfficesTable 
        offices={data.offices}
        isLoading={state.isLoading}
        isFetching={state.isFetching}
        isDeleting={state.isDeleting}
        officeToDelete={state.officeToDelete}
        openEditModal={actions.openEditModal}
        setOfficeToDelete={actions.setOfficeToDelete}
      />

      <OfficeFormModal 
        isModalOpen={state.isModalOpen}
        editingOffice={state.editingOffice}
        formData={state.formData}
        setFormData={actions.setFormData}
        logoFile={state.logoFile}
        setLogoFile={actions.setLogoFile}
        celebrationSoundFile={state.celebrationSoundFile}
        setCelebrationSoundFile={actions.setCelebrationSoundFile}
        errorMsg={state.errorMsg}
        fileInputRef={state.fileInputRef}
        soundInputRef={state.soundInputRef}
        isCreating={state.isCreating}
        isUpdating={state.isUpdating}
        handleCreateOrUpdateOffice={actions.handleCreateOrUpdateOffice}
        closeModal={actions.closeModal}
      />

      <DeleteOfficeModal 
        officeToDelete={state.officeToDelete}
        isDeleting={state.isDeleting}
        handleDeleteOffice={actions.handleDeleteOffice}
        setOfficeToDelete={actions.setOfficeToDelete}
      />
    </div>
  );
}
