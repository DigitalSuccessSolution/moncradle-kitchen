"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Plus, Bell, X, AlertTriangle, ChefHat, CheckCircle2, ChevronRight, PackageCheck, User, LogOut } from "lucide-react";
import axios from "axios";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [profileData, setProfileData] = useState<{name: string, avatar: string | null}>({ name: "", avatar: null });

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [hasFetchedSearch, setHasFetchedSearch] = useState(false);

  const notifications = [
    { id: '1', title: 'Low Stock Alert: Organic Carrots', time: '10m ago', type: 'alert', text: 'Stock down to 4.2 kg (Threshold 15 kg)' },
    { id: '2', title: 'Batch #3999 Finishing Packaging', time: '25m ago', type: 'batch', text: 'Sweet Potato Mash ready for labeling' },
    { id: '3', title: 'Hygiene Audit Logged', time: '1h ago', type: 'system', text: 'Cold storage temp verified at 2.4°C' }
  ];

  const unreadCount = notifications.length;

  const filteredOrders = searchQuery.trim()
    ? orders.filter(o => (o._id || "").toLowerCase().includes(searchQuery.toLowerCase()) || (o.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) || (o.items?.[0]?.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredBatches = searchQuery.trim()
    ? batches.filter(b => (b.batchNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) || (b.recipeName || "").toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredStock = searchQuery.trim()
    ? inventory.filter(i => (i.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (i.sku || "").toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchFocus = async () => {
    setShowSearchDropdown(true);
    if (!hasFetchedSearch) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [ordersRes, batchesRes, inventoryRes] = await Promise.all([
          axios.get(`${apiUrl}/orders?limit=100`, config),
          axios.get(`${apiUrl}/batches?limit=50`, config),
          axios.get(`${apiUrl}/inventory?limit=100`, config)
        ]);

        setOrders(ordersRes.data.data || []);
        setBatches(batchesRes.data.data || []);
        setInventory(inventoryRes.data.data || []);
        setHasFetchedSearch(true);
      } catch (err) {
        console.error("Failed to load search data", err);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            name: profile.ownerName || profile.kitchenName || user.name || "",
            avatar: profile.avatar || user.avatar || null
          });
        }
      } catch (err) {
        console.error("Failed to load header profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleOpenQuickAction = () => {
    window.dispatchEvent(new CustomEvent("open-quick-action"));
  };

  return (
    <header className="z-30 bg-[#F8F9FA]/90 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Mobile Logo (Visible only on mobile) */}
        <div className="md:hidden flex items-center">
          <Link href="/" className="block">
            <Image
              src="/logo.png"
              alt="Moncradel Logo"
              width={200}
              height={60}
              className="w-[180px] sm:w-[200px] h-auto max-h-[50px] object-contain object-left"
            />
          </Link>
        </div>
        {/* Center: Live Interactive Search Bar */}
        <div ref={searchRef} className="flex-1 max-w-md hidden md:block relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/70" />
            <input
              type="text"
              placeholder="Search ingredients, batches, or SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearchFocus();
              }}
              onFocus={handleSearchFocus}
              className="w-full bg-white border border-brand/20 rounded-full pl-10 pr-9 py-2 text-sm text-brand placeholder-brand/40 focus:outline-none focus:border-brand/50 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Interactive Live Search Dropdown */}
          {showSearchDropdown && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Kitchen Search Results</span>
                <span>Press ESC to close</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                {filteredOrders.length > 0 && (
                  <div className="p-2 bg-[#A5D8FF]/10 font-bold text-brand">
                    Orders ({filteredOrders.length})
                  </div>
                )}
                {filteredOrders.map((o) => (
                  <Link
                    key={o._id}
                    href="/orders"
                    onClick={() => setShowSearchDropdown(false)}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-900">#{o._id ? o._id.slice(-6).toUpperCase() : 'ORD'} - {o.customerName || "Customer"}</span>
                    <span className="text-slate-500">{o.items?.[0]?.name || "Custom Meal"}</span>
                  </Link>
                ))}

                {filteredBatches.length > 0 && (
                  <div className="p-2 bg-[#A5D8FF]/10 font-bold text-brand">
                    Batches ({filteredBatches.length})
                  </div>
                )}
                {filteredBatches.map((b) => (
                  <Link
                    key={b._id}
                    href="/cooking-batches"
                    onClick={() => setShowSearchDropdown(false)}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-900">{b.batchNumber} - {b.recipeName}</span>
                    <span className="font-semibold text-emerald-600 capitalize">{b.status}</span>
                  </Link>
                ))}

                {filteredStock.length > 0 && (
                  <div className="p-2 bg-[#A5D8FF]/10 font-bold text-brand">
                    Stock Items ({filteredStock.length})
                  </div>
                )}
                {filteredStock.map((s) => (
                  <Link
                    key={s._id}
                    href="/stock-management"
                    onClick={() => setShowSearchDropdown(false)}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-900">{s.name} ({s.sku})</span>
                    <span className={`font-semibold ${s.quantity <= (s.minThreshold || 10) ? 'text-rose-600' : 'text-slate-700'}`}>{s.quantity} {s.unit}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search button */}
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="hidden p-2.5 text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Link */}
          <Link
            href="/notifications"
            className="relative p-2.5 text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-brand" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
            )}
          </Link>

          {/* Profile Section */}
          <div className="relative group ml-1 sm:ml-2 hidden md:block">
            <div className="flex items-center gap-3 cursor-pointer py-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center shrink-0">
                {profileData.avatar ? (
                  <Image src={profileData.avatar} alt="Profile" width={44} height={44} className="object-cover w-full h-full" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
              {profileData.name && (
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">{profileData.name}</span>
                  <span className="text-[11px] font-medium text-slate-500">Kitchen Admin</span>
                </div>
              )}
            </div>

            {/* Hover Dropdown */}
            <div className="absolute right-0 top-full mt-0 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
              <div className="p-2 space-y-1">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-slate-700 hover:text-brand hover:bg-brand/5 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </Link>
                <div className="h-px bg-slate-100 my-1"></div>
                <button 
                  onClick={() => {
                    localStorage.removeItem("moncradel_kitchen_auth");
                    localStorage.removeItem("moncradel_kitchen_token");
                    localStorage.removeItem("moncradel_kitchen_user");
                    localStorage.removeItem("moncradel_onboarding_seen");
                    document.cookie = "moncradel_kitchen_token=; path=/; max-age=0";
                    window.location.href = "/login";
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search bar dropdown */}
      {showSearchInput && (
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/70" />
            <input
              type="text"
              placeholder="Search ingredients, SKU or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-brand/20 rounded-full pl-10 pr-4 py-2 text-sm text-brand placeholder-brand/40 focus:outline-none focus:border-brand/50"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
