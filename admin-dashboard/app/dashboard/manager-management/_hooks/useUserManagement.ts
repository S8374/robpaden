import { useState } from "react";
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation, useToggleUserStatusMutation, useUploadUserAvatarMutation } from "@/redux/api/user.api";
import { useGetOfficesQuery } from "@/redux/api/office.api";

export function useUserManagement() {
  const { data: usersData, isLoading, isFetching } = useGetUsersQuery();
  const { data: officesData } = useGetOfficesQuery();
  
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadUserAvatarMutation();
  
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
    agentLimit: "",
    avatarFile: null as File | null,
    avatarUrl: ""
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
        avatarUrl: formData.avatarUrl
      };

      if (formData.avatarFile) {
        const fileData = new FormData();
        fileData.append("file", formData.avatarFile);
        const uploadRes = await uploadAvatar(fileData).unwrap();
        if (uploadRes.success) {
          payload.avatarUrl = uploadRes.url;
        }
      }
      
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
          agentLimit: "",
          avatarFile: null,
          avatarUrl: ""
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
      agentLimit: "",
      avatarFile: null,
      avatarUrl: ""
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
      agentLimit: user.agentLimit ? String(user.agentLimit) : "",
      avatarFile: null,
      avatarUrl: user.avatarUrl || ""
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
        managerId: formData.role === "AGENT" && formData.managerId ? parseInt(formData.managerId) : null,
        avatarUrl: formData.avatarUrl
      };

      if (formData.avatarFile) {
        const fileData = new FormData();
        fileData.append("file", formData.avatarFile);
        const uploadRes = await uploadAvatar(fileData).unwrap();
        if (uploadRes.success) {
          payload.avatarUrl = uploadRes.url;
        }
      }
      
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

  return {
    state: {
      users,
      offices,
      managersList,
      isLoading,
      isFetching,
      isCreating: isCreating || isUploadingAvatar,
      isUpdating: isUpdating || isUploadingAvatar,
      isDeleting,
      isToggling,
      isModalOpen,
      isEditModalOpen,
      isDeleteModalOpen,
      selectedUser,
      openActionMenuId,
      formData,
      errorMsg,
      successMsg,
      showPassword
    },
    actions: {
      setIsModalOpen,
      setIsEditModalOpen,
      setIsDeleteModalOpen,
      setSelectedUser,
      setOpenActionMenuId,
      setFormData,
      setErrorMsg,
      setSuccessMsg,
      setShowPassword,
      handleCreateUser,
      openCreateModal,
      openEditModal,
      handleUpdateUser,
      handleDeleteUser,
      handleToggleStatus
    }
  };
}
