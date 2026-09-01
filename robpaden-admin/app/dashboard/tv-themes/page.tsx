"use client";

import React, { useState, useRef, useEffect } from "react";
import { useGetOfficesQuery, useUpdateOfficeMutation, Office, useGetTvDevicesQuery, useDeleteTvDeviceMutation, useBlockTvDeviceMutation } from "@/redux/api/office.api";
import { Upload, Loader2, MonitorPlay, ChevronDown, Check, MonitorSmartphone, XCircle, ShieldBan, Clock } from "lucide-react";

export default function TVThemesPage() {
  const { data, isLoading } = useGetOfficesQuery();
  const [updateOffice, { isLoading: isUpdating }] = useUpdateOfficeMutation();
  const [deleteDevice] = useDeleteTvDeviceMutation();
  const [blockDevice] = useBlockTvDeviceMutation();
  
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | "">("");

  const { data: devicesData, isLoading: isLoadingDevices } = useGetTvDevicesQuery(Number(selectedOfficeId), {
    skip: !selectedOfficeId
  });
  const devices = devicesData?.data || [];
  
  const [celebrationSoundFile, setCelebrationSoundFile] = useState<File | null>(null);
  const [tvTheme, setTvTheme] = useState("default");
  const [tvPassword, setTvPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isOfficeDropdownOpen, setIsOfficeDropdownOpen] = useState(false);
  
  const soundInputRef = useRef<HTMLInputElement>(null);
  
  const themeOptions = [
    { value: "default", label: "Default Dark", description: "Classic dark mode" },
    { value: "cyberpunk", label: "Neon Cyberpunk", description: "Vibrant fuchsia & cyan" },
    { value: "midnight-gold", label: "Midnight Gold", description: "Rich black with gold accents" },
    { value: "ocean-deep", label: "Ocean Deep", description: "Deep navy and sky blue" },
    { value: "crimson-glow", label: "Crimson Glow", description: "Charcoal with crimson red" },
    { value: "galactic-energy", label: "Galactic Energy", description: "Deep purple and electric green" },
    { value: "lava-strike", label: "Lava Strike", description: "Obsidian black with fiery orange" },
    { value: "neon-matrix", label: "Neon Matrix", description: "Dark green with matrix highlights" },
  ];

  const offices = data?.data || [];
  const selectedOffice = offices.find((o) => o.id === selectedOfficeId) || null;

  useEffect(() => {
    if (selectedOffice) {
      setTvTheme(selectedOffice.settings?.tvTheme || "default");
      setTvPassword(selectedOffice.settings?.tvPassword || "");
      setCelebrationSoundFile(null);
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [selectedOfficeId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficeId) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = new FormData();
      if (celebrationSoundFile) payload.append("celebrationSoundUrl", celebrationSoundFile);
      payload.append("tvTheme", tvTheme);
      payload.append("tvPassword", tvPassword);

      const res = await updateOffice({ id: Number(selectedOfficeId), data: payload }).unwrap();
      
      if (res.success) {
        setSuccessMsg("TV Configuration saved successfully.");
      } else {
        setErrorMsg(res.message || "Failed to save configuration.");
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "An error occurred while saving.");
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to remove this device? It will be logged out.")) return;
    try {
      await deleteDevice(deviceId).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleBlockDevice = async (deviceId: string, currentStatus: boolean) => {
    const action = currentStatus ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} this device?`)) return;
    try {
      await blockDevice({ deviceId, isBlocked: !currentStatus }).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mx-auto pb-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <MonitorPlay className="w-6 h-6" /> TV Themes & Configuration
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Configure TV boards for your offices.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm">
        <div className="p-6 border-b border-zinc-100">
          <label className="block text-sm font-semibold text-zinc-700 mb-2">
            Select Office
          </label>
          <div className="relative max-w-md z-50">
            <div 
              onClick={() => !isLoading && setIsOfficeDropdownOpen(!isOfficeDropdownOpen)}
              className={`w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all cursor-pointer flex justify-between items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`font-medium ${selectedOffice ? 'text-zinc-900' : 'text-zinc-500'}`}>
                {selectedOffice ? selectedOffice.name : "-- Choose an office --"}
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOfficeDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isOfficeDropdownOpen && !isLoading && (
              <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
                <div className="p-1">
                  {offices.map((office) => (
                    <div
                      key={office.id}
                      onClick={() => {
                        setSelectedOfficeId(office.id);
                        setIsOfficeDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors ${selectedOfficeId === office.id ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
                    >
                      <span className={`text-sm font-medium ${selectedOfficeId === office.id ? 'text-zinc-900' : 'text-zinc-700'}`}>
                        {office.name}
                      </span>
                      {selectedOfficeId === office.id && (
                        <Check className="w-4 h-4 text-zinc-900" />
                      )}
                    </div>
                  ))}
                  {offices.length === 0 && (
                    <div className="px-3 py-2.5 text-sm text-zinc-500">No offices found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedOffice ? (
          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* TV Sound */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Celebration Sound</label>
                <div 
                  onClick={() => soundInputRef.current?.click()}
                  className="w-full px-4 py-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-sm">
                    {celebrationSoundFile ? (
                      <span className="font-medium text-zinc-900">{celebrationSoundFile.name}</span>
                    ) : (
                      <span className="text-zinc-500">
                         {selectedOffice.settings?.celebrationSoundUrl ? "Change existing sound..." : "Upload sound/video file..."}
                      </span>
                    )}
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={soundInputRef}
                  onChange={(e) => setCelebrationSoundFile(e.target.files?.[0] || null)}
                  className="hidden"
                  accept="audio/*,video/*"
                />
              </div>

              {/* TV Theme */}
              <div className="relative z-40">
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">TV Theme</label>
                <div 
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span className="font-medium text-zinc-900">
                    {themeOptions.find(t => t.value === tvTheme)?.label || "Select Theme"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isThemeDropdownOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
                    <div className="p-1">
                      {themeOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => {
                            setTvTheme(option.value);
                            setIsThemeDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors ${tvTheme === option.value ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
                        >
                          <div className="flex flex-col">
                            <span className={`text-sm font-medium ${tvTheme === option.value ? 'text-zinc-900' : 'text-zinc-700'}`}>
                              {option.label}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {option.description}
                            </span>
                          </div>
                          {tvTheme === option.value && (
                            <Check className="w-4 h-4 text-zinc-900" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TV Password */}
              <div>
                <label htmlFor="tvPassword" className="block text-sm font-semibold text-zinc-700 mb-1.5">TV Board Password</label>
                <input 
                  id="tvPassword"
                  type="text" 
                  value={tvPassword}
                  onChange={(e) => setTvPassword(e.target.value)}
                  placeholder="Set password for /tv access"
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 focus:bg-white transition-all"
                />
              </div>

            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                {successMsg}
              </div>
            )}

            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <button 
                type="submit"
                disabled={isUpdating}
                className="px-6 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isUpdating ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-12 text-center text-zinc-500">
            Please select an office to configure its TV Themes.
          </div>
        )}
      </div>

      {/* Connected Devices Section */}
      {selectedOffice && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mt-6">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <MonitorSmartphone className="w-5 h-5" /> Connected Devices
              </h2>
              <p className="text-sm text-zinc-500 mt-1">Manage devices currently accessing this office's TV Board.</p>
            </div>
            <div className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full font-medium">
              {devices.length} {devices.length === 1 ? 'Device' : 'Devices'} Found
            </div>
          </div>
          
          <div className="p-0 overflow-x-auto overflow-y-auto max-h-[300px]">
            {isLoadingDevices ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
            ) : devices.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No devices have connected to this TV board yet.</div>
            ) : (
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="bg-zinc-50/50 text-xs text-zinc-500 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4 border-b border-zinc-100">Device Name</th>
                    <th className="px-6 py-4 border-b border-zinc-100">Last Seen</th>
                    <th className="px-6 py-4 border-b border-zinc-100">Status</th>
                    <th className="px-6 py-4 border-b border-zinc-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {Object.entries(
                    devices.reduce((acc, device) => {
                      const name = device.deviceName || "Unknown Device";
                      if (!acc[name]) acc[name] = [];
                      acc[name].push(device);
                      return acc;
                    }, {} as Record<string, typeof devices>)
                  ).map(([groupName, groupDevices]) => {
                    if (groupDevices.length === 1) {
                      const device = groupDevices[0];
                      return (
                        <tr key={device.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-zinc-900">{device.deviceName}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-zinc-400" />
                              {new Date(device.lastSeenAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {device.isBlocked ? (
                              <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-bold bg-red-100 text-red-700">
                                BLOCKED
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-bold bg-green-100 text-green-700">
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleToggleBlockDevice(device.id, device.isBlocked)}
                                className={`p-1.5 rounded transition-colors ${device.isBlocked ? 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200' : 'text-orange-600 bg-orange-50 hover:bg-orange-100'}`}
                                title={device.isBlocked ? "Unblock Device" : "Block Device"}
                              >
                                <ShieldBan className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleRemoveDevice(device.id)}
                                className="p-1.5 rounded text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                title="Remove Access (Logout)"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <React.Fragment key={groupName}>
                        <tr 
                          onClick={() => setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))}
                          className="hover:bg-zinc-50 transition-colors cursor-pointer bg-zinc-50/50"
                        >
                          <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-2">
                            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${expandedGroups[groupName] ? 'rotate-180' : ''}`} />
                            {groupName} <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{groupDevices.length}</span>
                          </td>
                          <td className="px-6 py-4 text-zinc-500 text-sm">
                            Multiple Sessions
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-bold bg-blue-100 text-blue-700">
                              GROUP
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-xs text-zinc-400 font-medium">Click to expand</span>
                          </td>
                        </tr>
                        
                        {expandedGroups[groupName] && groupDevices.map((device, index) => (
                          <tr key={device.id} className="hover:bg-zinc-50 transition-colors bg-white">
                            <td className="px-6 py-4 pl-12 font-medium text-zinc-500 text-sm flex items-center gap-2 border-l-2 border-blue-500">
                              Session {index + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                {new Date(device.lastSeenAt).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {device.isBlocked ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-bold bg-red-100 text-red-700">
                                  BLOCKED
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-bold bg-green-100 text-green-700">
                                  ACTIVE
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleToggleBlockDevice(device.id, device.isBlocked); }}
                                  className={`p-1.5 rounded transition-colors ${device.isBlocked ? 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200' : 'text-orange-600 bg-orange-50 hover:bg-orange-100'}`}
                                  title={device.isBlocked ? "Unblock Device" : "Block Device"}
                                >
                                  <ShieldBan className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleRemoveDevice(device.id); }}
                                  className="p-1.5 rounded text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                  title="Remove Access (Logout)"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
