"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingBag,
  Flame,
  Package,
  Menu,
  Clock
} from "lucide-react";

interface NavigationProps {
  mode: "desktop" | "mobile";
}

export default function Navigation({ mode }: NavigationProps) {
  const pathname = usePathname();
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

  const adminNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Kitchen", href: "/cooking-batches", icon: Flame },
    { name: "Stock", href: "/stock-management", icon: Package },
    { name: "More", href: "/more", icon: Menu },
  ];

  const staffNavItems = [
    { name: "Attendance", href: "/attendance", icon: Clock },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Kitchen", href: "/cooking-batches", icon: Flame },
    { name: "Stock", href: "/stock-management", icon: Package },
    { name: "More", href: "/more", icon: Menu },
  ];

  const mobileNavItems = userRole === "kitchen_staff" ? staffNavItems : adminNavItems;

  if (mode === "desktop") {
    return null; // Desktop is now handled by the separate Sidebar component
  }

  // Mobile Bottom Navigation Bar
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 group py-1 px-1"
            >
              <div
                className={`w-12 h-8 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-brand text-white shadow-sm scale-105"
                    : "text-slate-500 group-hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isActive ? "text-brand font-bold" : "text-slate-500"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
