"use client";

import React, { useState, useRef, useEffect } from "react";
import { useGetOfficesQuery, useUpdateOfficeMutation, Office, useGetTvDevicesQuery, useDeleteTvDeviceMutation, useBlockTvDeviceMutation } from "@/redux/api/office.api";
import { Upload, Loader2, MonitorPlay, ChevronDown, Check, MonitorSmartphone, XCircle, ShieldBan, Clock, Play, Square } from "lucide-react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

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
  
  const [celebrationSoundStartTime, setCelebrationSoundStartTime] = useState(0);
  const [celebrationSoundDuration, setCelebrationSoundDuration] = useState(10);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLMediaElement | null>(null);

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
      setCelebrationSoundStartTime(selectedOffice.settings?.celebrationSoundStartTime || 0);
      setCelebrationSoundDuration(selectedOffice.settings?.celebrationSoundDuration || 10);
      setCelebrationSoundFile(null);
      setIsPlayingPreview(false);
      setErrorMsg("");
      setSuccessMsg("");

      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }

      if (selectedOffice.settings?.celebrationSoundUrl) {
        const audio = new Audio(selectedOffice.settings.celebrationSoundUrl);
        audio.onloadedmetadata = () => setMediaDuration(audio.duration);
      }
    }
  }, [selectedOfficeId]);

  useEffect(() => {
    if (celebrationSoundFile) {
      const url = URL.createObjectURL(celebrationSoundFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (selectedOffice?.settings?.celebrationSoundUrl) {
      setPreviewUrl(selectedOffice.settings.celebrationSoundUrl);
    } else {
      setPreviewUrl("");
    }
  }, [celebrationSoundFile, selectedOffice?.settings?.celebrationSoundUrl]);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) previewAudioRef.current.pause();
    };
  }, []);

  const playPreview = () => {
    if (isPlayingPreview) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingPreview(false);
      return;
    }

    if (previewAudioRef.current) {
      const audio = previewAudioRef.current;
      audio.currentTime = celebrationSoundStartTime;
      audio.play().catch(e => console.error("Playback failed:", e));
      setIsPlayingPreview(true);

      const checkTime = () => {
        if (audio.currentTime >= celebrationSoundStartTime + celebrationSoundDuration) {
          audio.pause();
          setIsPlayingPreview(false);
          audio.removeEventListener("timeupdate", checkTime);
        }
      };
      audio.addEventListener("timeupdate", checkTime);
      audio.addEventListener("ended", () => setIsPlayingPreview(false), { once: true });
    }
  };

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
      payload.append("celebrationSoundStartTime", celebrationSoundStartTime.toString());
      payload.append("celebrationSoundDuration", celebrationSoundDuration.toString());

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

      {!selectedOffice ? (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Select an Office to Configure</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
          ) : offices.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No offices found. Create an office first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offices.map((office) => (
                <div 
                  key={office.id}
                  onClick={() => setSelectedOfficeId(office.id)}
                  className="group relative bg-zinc-50 border border-zinc-200 rounded-xl p-5 cursor-pointer hover:border-zinc-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-3">
                      <MonitorPlay className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1">{office.name}</h3>
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      Theme: {themeOptions.find(t => t.value === (office.settings?.tvTheme || 'default'))?.label || 'Default'}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors">
                    Configure TV <ChevronDown className="w-4 h-4 ml-1 -rotate-90" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
          <button 
            onClick={() => setSelectedOfficeId("")}
            className="mb-4 flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ChevronDown className="w-4 h-4 mr-1 rotate-90" /> Back to Offices
          </button>
          
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  {selectedOffice.name} TV Configuration
                </h2>
                <p className="text-sm text-zinc-500 mt-1">Update theme, password, and sounds.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Left Column: TV Sound Settings */}
                <div className="space-y-6">
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
                  
                  {/* Always show Duration Control */}
                  <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <label className="block text-sm font-semibold text-zinc-900 mb-1">
                      Animation & Sound Duration (Seconds)
                    </label>
                    <p className="text-xs text-zinc-500 mb-4">
                      Control exactly how long the BOOM animation and sound will play on the TV screen.
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="3" 
                        max="30" 
                        step="1"
                        value={celebrationSoundDuration}
                        onChange={(e) => setCelebrationSoundDuration(Number(e.target.value))}
                        className="flex-1 accent-zinc-900"
                      />
                      <div className="w-16 px-3 py-1.5 bg-white border border-zinc-200 rounded text-center text-sm font-bold text-zinc-900 shadow-sm">
                        {celebrationSoundDuration}s
                      </div>
                    </div>
                  </div>

                  {(celebrationSoundFile || selectedOffice.settings?.celebrationSoundUrl) && (
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg animate-in fade-in zoom-in-95">
                      
                      {/* Hidden Video element for metadata extraction and playback */}
                      <video 
                        className="hidden"
                        ref={(el) => {
                           if (el) previewAudioRef.current = el as any;
                        }}
                        src={previewUrl}
                        onLoadedMetadata={(e) => {
                          setMediaDuration(e.currentTarget.duration);
                        }}
                      />

                      <label className="block text-sm font-semibold text-zinc-700 mb-2">Custom Sound Trimmer</label>
                      <p className="text-xs text-zinc-500 mb-4">
                        Slide the track to select which part of the audio to play. Drag the handles to adjust the duration.
                      </p>
                      <div className="flex items-center gap-4 px-2">
                        <span className="text-xs font-medium text-zinc-500">0s</span>
                        <div className="flex-1 px-2 pt-1 pb-2">
                           <Slider
                             range={{ draggableTrack: true }}
                             allowCross={false}
                             min={0}
                             max={mediaDuration ? Math.floor(mediaDuration) : 100}
                             value={[celebrationSoundStartTime, celebrationSoundStartTime + celebrationSoundDuration]}
                             onChange={(val: any) => {
                               const [start, end] = val as [number, number];
                               let newDuration = end - start;
                               // Clamp duration between 3 and 30s
                               if (newDuration < 3) newDuration = 3;
                               if (newDuration > 30) newDuration = 30;
                               setCelebrationSoundStartTime(start);
                               setCelebrationSoundDuration(newDuration);
                             }}
                             styles={{
                               track: { backgroundColor: '#18181b' },
                               handle: { borderColor: '#18181b', backgroundColor: '#18181b' }
                             }}
                           />
                        </div>
                        <span className="text-xs font-medium text-zinc-500">{mediaDuration ? Math.floor(mediaDuration) + 's' : '...'}</span>
                      </div>

                      <div className="flex justify-between items-center mt-6 pt-3 border-t border-zinc-200">
                        <div className="text-sm font-medium text-zinc-900">
                          Playing: {celebrationSoundStartTime}s - {celebrationSoundStartTime + celebrationSoundDuration}s <span className="text-zinc-500 font-normal">({celebrationSoundDuration}s total)</span>
                        </div>
                        <button 
                          type="button"
                          onClick={playPreview}
                          className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          {isPlayingPreview ? <Square className="w-3 h-3"/> : <Play className="w-3 h-3" />}
                          {isPlayingPreview ? "Stop" : "Preview Segment"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Theme & Security */}
                <div className="space-y-6">
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
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isUpdating ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>

          {/* Connected Devices Section */}
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
        </div>
      )}
    </div>
  );
}
