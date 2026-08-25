"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import {
  User,
  BookOpen,
  Bell,
  ShieldCheck,
  Users,
  BarChart3,
  LogOut,
  ChevronRight,
  ChevronLeft,
  LifeBuoy,
} from "lucide-react";
import { useKitchenAuth } from "@/context/KitchenAuthContext";

export default function MoreMenuPage() {
  const router = useRouter();
  const { logout } = useKitchenAuth();

  const [profileData, setProfileData] = useState<{ name: string, kitchen: string, email: string, phone: string, avatar: string | null }>({
    name: "Loading...",
    kitchen: "Manage your workspace",
    email: "",
    phone: "",
    avatar: null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("moncradel_kitchen_token");
        if (token) {
          const res = await axios.get(`${apiUrl}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const profile = res.data.profile || {};
          const user = res.data.user || {};
          setProfileData({
            name: user.name || "Kitchen Admin",
            kitchen: profile.kitchenName || "Moncradel Kitchen",
            email: user.email || "",
            phone: user.phone || "",
            avatar: profile.avatar || user.avatar || null
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        setProfileData({
          name: "Kitchen Admin",
          kitchen: "Moncradel Kitchen",
          email: "admin@moncradel.com",
          phone: "+91 0000000000",
          avatar: null
        });
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const menuItems = [
    { name: "My Profile", href: "/profile", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Notifications", href: "/notifications", icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Meals Catalog", href: "/meals", icon: BookOpen, color: "text-brand", bg: "bg-brand/10" },
    // { name: "Staff Management", href: "/staff-management", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Hygiene & Safety", href: "/hygiene", icon: ShieldCheck, color: "text-teal-600", bg: "bg-teal-50" },
    { name: "Reports & Analytics", href: "/reports", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
    { name: "Help & Support", href: "/support", icon: LifeBuoy, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];

  return (
    <div className="px-4 pt-4 pb-8 min-h-[100dvh] font-sans block md:hidden bg-white">

      {/* Back Button */}
      <div className="flex items-center mb-4">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors text-black"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-[14px] font-medium pr-1">Back</span>
        </button>
      </div>

      {/* Header Profile Section - Now a floating card */}
      <div className="bg-[#133F23] p-5 rounded-[24px] shadow-lg relative overflow-hidden mb-6 mx-1">
        {/* Abstract background shapes */}
        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-[-30px] left-[-30px] w-[100px] h-[100px] bg-white/10 rounded-full blur-xl" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-0.5 shadow-md shrink-0 overflow-hidden">
            {profileData.avatar ? (
              <Image src={profileData.avatar} alt="Profile" width={64} height={64} className="object-cover w-full h-full rounded-full" />
            ) : (
              <div className="w-full h-full rounded-full bg-[#EBF0E7] flex items-center justify-center border-2 border-white">
                <User className="w-8 h-8 text-[#133F23]" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-medium text-white tracking-tight truncate">{profileData.name}</h1>
            <p className="text-[#A5D8FF] text-[13px] font-normal truncate mb-1">{profileData.kitchen}</p>
            {(profileData.email || profileData.phone) && (
              <div className="flex flex-col gap-0.5 mt-1">
                {profileData.email && <p className="text-white/80 text-[11px] font-normal truncate">{profileData.email}</p>}
                {profileData.phone && <p className="text-white/80 text-[11px] font-normal truncate">{profileData.phone}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-col">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between py-4 px-2 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.bg}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-[15px] font-medium text-[#163C24]">
                    {item.name}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-black" />
              </Link>
            );
          })}

          {/* Logout Button directly in the list */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-between py-4 px-2 bg-white hover:bg-red-50 transition-colors group mt-2"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-red-50 group-hover:bg-red-100 transition-colors">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-[15px] font-medium text-red-600">
                Log Out
              </span>
            </div>
          </button>

          {/* Footer Links */}
          <div className="mt-8 mb-4 flex flex-col items-center justify-center gap-3 text-[13px] font-medium text-slate-400">
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            </div>
            <p>v1.0.0 • © {new Date().getFullYear()} Moncradle</p>
          </div>
        </div>
      </div>
    </div>
  );
}
