import { useState, useRef } from "react";
import { useGetOfficesQuery, useCreateOfficeMutation, useUpdateOfficeMutation, useDeleteOfficeMutation, Office } from "@/redux/api/office.api";

export const formatAMPM = (timeStr: string) => {
  if (!timeStr) return "";
  const [hourStr, minute] = timeStr.split(":");
  if (!hourStr || !minute) return timeStr;
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  const hourFormatted = hour < 10 ? `0${hour}` : hour;
  return `${hourFormatted}:${minute} ${ampm}`;
};

export const parseTime = (timeStr: string) => {
  if (!timeStr) return new Date();
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h, 10));
  d.setMinutes(parseInt(m || '0', 10));
  d.setSeconds(0);
  return d;
};

export const formatTime = (date: Date | null) => {
  if (!date) return "09:00";
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

export function useOffices() {
  const { data, isLoading, isFetching } = useGetOfficesQuery();
  const [createOffice, { isLoading: isCreating }] = useCreateOfficeMutation();
  const [updateOffice, { isLoading: isUpdating }] = useUpdateOfficeMutation();
  const [deleteOffice, { isLoading: isDeleting }] = useDeleteOfficeMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [officeToDelete, setOfficeToDelete] = useState<{id: number, name: string} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    timeZone: "UTC",
    officeStartTime: "09:00",
    officeCloseTime: "17:00",
    monthlyGoal: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  const offices = data?.data || [];

  const handleCreateOrUpdateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Office name is required");
      return;
    }
    
    try {
      const payload = new FormData();
      if (editingOffice) {
        payload.append("companyName", formData.name);
      } else {
        payload.append("name", formData.name);
      }
      payload.append("timeZone", formData.timeZone);
      payload.append("officeStartTime", formData.officeStartTime);
      payload.append("officeCloseTime", formData.officeCloseTime);
      if (formData.monthlyGoal) payload.append("monthlyGoal", formData.monthlyGoal);

      let res;
      if (editingOffice) {
        res = await updateOffice({ id: editingOffice.id, data: payload }).unwrap();
      } else {
        res = await createOffice(payload).unwrap();
      }

      if (res.success) {
        closeModal();
      } else {
        setErrorMsg(res.message || "Failed to save office");
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Something went wrong.");
    }
  };

  const openEditModal = (office: Office) => {
    setEditingOffice(office);
    setFormData({
      name: office.name,
      timeZone: office.settings?.timeZone || "UTC",
      officeStartTime: office.settings?.officeStartTime || "09:00",
      officeCloseTime: office.settings?.officeCloseTime || "17:00",
      monthlyGoal: office.settings?.monthlyGoal ? String(office.settings.monthlyGoal) : ""
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingOffice(null);
    setFormData({
      name: "",
      timeZone: "UTC",
      officeStartTime: "09:00",
      officeCloseTime: "17:00",
      monthlyGoal: ""
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffice(null);
    setErrorMsg("");
  };

  const handleDeleteOffice = async () => {
    if (!officeToDelete) return;
    try {
      await deleteOffice(officeToDelete.id).unwrap();
      setOfficeToDelete(null);
    } catch (error) {
      console.error("Failed to delete office:", error);
    }
  };

  return {
    state: {
      isLoading,
      isFetching,
      isCreating,
      isUpdating,
      isDeleting,
      isModalOpen,
      editingOffice,
      officeToDelete,
      formData,
      errorMsg,
    },
    data: {
      offices,
    },
    actions: {
      setFormData,
      setErrorMsg,
      setOfficeToDelete,
      handleCreateOrUpdateOffice,
      openEditModal,
      openCreateModal,
      closeModal,
      handleDeleteOffice,
    }
  };
}
