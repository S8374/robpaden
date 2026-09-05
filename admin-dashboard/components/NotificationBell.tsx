"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useGetUnreadNotificationsQuery, useMarkAsReadMutation } from "@/redux/api/notification.api";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { data: response } = useGetUnreadNotificationsQuery(undefined, {
    pollingInterval: 30000, // Refresh every 30 seconds
  });
  
  const [markAsRead] = useMarkAsReadMutation();
  
  const notifications = response?.data || [];
  const unreadCount = notifications.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: any) => {
    try {
      await markAsRead(notification.id).unwrap();
      setIsOpen(false);
      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="relative p-2 cursor-pointer text-zinc-400 hover:text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-zinc-200 text-zinc-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {notifications.map((notification: any) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors flex items-start gap-3 relative group"
                  >
                    {/* Unread dot */}
                    <div className="mt-1.5 min-w-2 h-2 rounded-full bg-blue-500"></div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {notification.action}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                        {notification.entityName}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
