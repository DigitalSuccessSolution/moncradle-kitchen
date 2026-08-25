"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Trash2, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  orderId?: string;
  createdAt: string;
}

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
      const res = await axios.get(`${apiUrl}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.data) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
      await axios.patch(`${apiUrl}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const deleteNotification = (id: string) => {
    Swal.fire({
      title: 'Delete this notification?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      backdrop: 'rgba(15, 23, 42, 0.4)',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-lg font-semibold text-slate-800',
        confirmButton: 'rounded-lg font-medium shadow-sm',
        cancelButton: 'rounded-lg font-medium',
        container: 'backdrop-blur-sm'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
          await axios.delete(`${apiUrl}/notifications/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotifications(notifications.filter(n => n._id !== id));
          if (selectedNotification?._id === id) {
             setSelectedNotification(null);
          }
          Swal.fire({
            title: 'Deleted!',
            text: 'Notification has been deleted.',
            icon: 'success',
            confirmButtonColor: '#059669',
            backdrop: 'rgba(15, 23, 42, 0.4)',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-lg font-medium shadow-sm',
              container: 'backdrop-blur-sm'
            }
          });
        } catch (error) {
          console.error("Error deleting notification", error);
        }
      }
    });
  };

  const handleClearAll = () => {
    Swal.fire({
      title: 'Clear all notifications?',
      text: "You won't be able to revert this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, clear all',
      cancelButtonText: 'Cancel',
      backdrop: 'rgba(15, 23, 42, 0.4)',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-lg font-semibold text-slate-800',
        confirmButton: 'rounded-lg font-medium shadow-sm',
        cancelButton: 'rounded-lg font-medium',
        container: 'backdrop-blur-sm'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Optimistically clear UI
        const temp = [...notifications];
        setNotifications([]);
        
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
          
          await Promise.all(temp.map(n => axios.delete(`${apiUrl}/notifications/${n._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })));

          Swal.fire({
            title: 'Cleared!',
            text: 'Your notifications have been cleared.',
            icon: 'success',
            confirmButtonColor: '#059669',
            backdrop: 'rgba(15, 23, 42, 0.4)',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-lg font-medium shadow-sm',
              container: 'backdrop-blur-sm'
            }
          });
        } catch (err) {
           console.error(err);
        }
      }
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-2xl mx-auto lg:max-w-none lg:mx-0 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between gap-1 sm:gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] sm:text-3xl font-medium text-slate-900 tracking-tight mb-0 sm:mb-1">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="inline-block bg-brand/10 text-brand text-[11px] sm:text-[13px] font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full whitespace-nowrap">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-700 font-medium hidden md:block">
            Real-time updates for your kitchen operations
          </p>
        </div>

        <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => {
              notifications.forEach(n => {
                if (!n.isRead) markAsRead(n._id);
              });
            }}
            className="bg-white hover:bg-slate-50 text-slate-700 text-[12px] sm:text-[13px] font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap"
            title="Mark All Read"
          >
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={handleClearAll}
            className="bg-white hover:bg-rose-50 text-rose-600 font-medium w-8 h-8 sm:w-10 sm:h-[38px] rounded-lg border border-slate-200 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            title="Clear All Notifications"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20 animate-fade-in-up">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="sm:bg-white sm:rounded-lg py-16 sm:p-12 text-center sm:border sm:border-slate-200/80 space-y-3 animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}>
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-[17px] font-medium text-slate-900">No Notifications</h3>
          <p className="text-[14px] text-slate-500 font-medium max-w-sm mx-auto mt-2">
            You're all caught up! No new alerts at the moment.
          </p>
        </div>
      ) : (
        <div className="-mx-4 sm:mx-0 sm:bg-white sm:rounded-lg sm:border border-slate-200/80 overflow-hidden divide-y divide-slate-100 animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                setSelectedNotification(n);
                if (!n.isRead) {
                  markAsRead(n._id);
                }
              }}
              className={`group px-4 py-5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors cursor-pointer ${
                !n.isRead ? "bg-brand/5 sm:hover:bg-brand/10" : "bg-white sm:hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-start gap-4 min-w-0 w-full">
                <div className="pt-0.5 sm:pt-1 text-brand shrink-0">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div className="min-w-0 w-full flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-medium text-slate-900 text-[15px] sm:text-[16px] leading-tight truncate">
                        {n.title}
                      </h3>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                      )}
                    </div>
                    <span className="text-[13px] font-medium text-slate-500 whitespace-nowrap shrink-0 mt-0.5">
                      {getTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-[12px] sm:text-[13px] text-slate-700 font-medium leading-relaxed pr-2 sm:pr-8">
                    {n.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification Details Modal */}
      {mounted && selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 transition-opacity" 
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedNotification(null)}
          />
          <div className="relative bg-white w-full sm:max-w-md h-auto max-h-[85vh] overflow-hidden animate-slide-up shadow-2xl rounded-t-2xl sm:rounded-2xl pointer-events-auto flex flex-col font-sans">
            <div className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="bg-brand/10 p-2 rounded-xl text-brand">
                   <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 leading-tight">Notification Details</h3>
                  <span className="text-[12px] font-medium text-slate-500">{getTimeAgo(selectedNotification.createdAt)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <h4 className="text-[16px] font-medium text-black mb-3">{selectedNotification.title}</h4>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                {selectedNotification.message}
              </p>

              {selectedNotification.orderId && (
                <div className="mt-6">
                  <Link href={`/orders`} className="block w-full text-center bg-brand hover:bg-brand-hover text-white font-medium text-[14px] py-3 rounded-xl transition-colors">
                    View Orders
                  </Link>
                </div>
              )}
            </div>

            <div className="p-4 bg-white">
               <button 
                 onClick={() => deleteNotification(selectedNotification._id)}
                 className="w-full text-center text-rose-500 hover:text-rose-600 font-medium text-[14px] py-2 transition-colors flex justify-center items-center gap-2"
               >
                 <Trash2 className="w-4 h-4" /> Delete Notification
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
