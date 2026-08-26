"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingBag,
  Flame,
  Package,
  BookOpen,
  Tag,
  Box,
  Truck,
  ShieldCheck,
  Users,
  BarChart3,
  Bell,
  User,
  UtensilsCrossed,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LifeBuoy,
  Clock
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>("kitchen");

  useEffect(() => {
    const userStr = localStorage.getItem("moncradel_kitchen_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {}
    }
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid, hideForStaff: true },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Cooking Batches", href: "/cooking-batches", icon: Flame },
    { name: "My Attendance", href: "/attendance", icon: Clock, showOnlyForStaff: true },
    { name: "Stock Management", href: "/stock-management", icon: Package },
    { name: "Meals", href: "/meals", icon: BookOpen },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Hygiene & Safety", href: "/hygiene", icon: ShieldCheck },
    { name: "Staff Management", href: "/staff-management", icon: Users, hideForStaff: true },
    { name: "Reports", href: "/reports", icon: BarChart3, hideForStaff: true },
    { name: "Help & Support", href: "/support", icon: LifeBuoy },
    { name: "Profile", href: "/profile", icon: User, hideForStaff: true },
    { name: "Terms of Service", href: "/terms", icon: BookOpen },
    { name: "Privacy Policy", href: "/privacy", icon: ShieldCheck },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (userRole === "kitchen_staff") {
      return !item.hideForStaff;
    } else {
      return !item.showOnlyForStaff;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("moncradel_kitchen_auth");
    localStorage.removeItem("moncradel_kitchen_token");
    localStorage.removeItem("moncradel_kitchen_user");
    localStorage.removeItem("moncradel_onboarding_seen");
    document.cookie = "moncradel_kitchen_token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return (
    <aside className={`h-full bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[80px]' : 'w-[250px]'}`}>
      {/* ─── Brand Header (fixed at top) ─── */}
      <div className={`pt-4 pb-3 shrink-0 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between pl-2 pr-2'}`}>
        {!isCollapsed && (
          <Link href="/" className="block">
            <Image
              src="/logo.png"
              alt="Moncradel Logo"
              width={400}
              height={120}
              className="w-[190px] h-auto object-contain"
              priority
            />
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-900 transition-transform duration-200 hover:scale-125 focus:outline-none"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* ─── Scrollable Nav Links ─── */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 pt-4 pb-3 overflow-x-hidden">
        <div className="space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`group flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3.5 gap-3'} py-2.5 rounded-lg text-[14px] transition-all duration-200 ${isActive
                  ? "bg-brand text-white font-medium shadow-sm"
                  : "text-slate-900 font-medium hover:bg-brand/5 hover:text-brand"
                  }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${isActive
                    ? "text-white/90"
                    : "text-slate-600 group-hover:text-brand"
                    }`}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>



    </aside>
  );
}
