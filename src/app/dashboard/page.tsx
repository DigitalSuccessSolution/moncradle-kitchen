"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Flame,
  Truck,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  Eye,
  UtensilsCrossed,
  Clock,
  ChevronDown
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import axios from "axios";
import OrderStatusChart from "@/components/OrderStatusChart";

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardFilter, setDashboardFilter] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('today');

  const fetchDashboardData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [ordersRes, batchesRes, inventoryRes] = await Promise.all([
        axios.get(`${apiUrl}/orders?limit=200`, config),
        axios.get(`${apiUrl}/batches?limit=100`, config),
        axios.get(`${apiUrl}/inventory?limit=200`, config)
      ]);

      setOrders(ordersRes.data.data || []);
      setBatches(batchesRes.data.data || []);
      setInventory(inventoryRes.data.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- Data Crunching ---
  
  const filteredOrders = orders.filter(o => {
    if (dashboardFilter === 'all') return true;
    const oDate = new Date(o.createdAt);
    const now = new Date();
    if (dashboardFilter === 'today') {
      return oDate >= new Date(now.setHours(0,0,0,0));
    } else if (dashboardFilter === 'week') {
      const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0);
      return oDate >= d;
    } else if (dashboardFilter === 'month') {
      const d = new Date(); d.setDate(d.getDate() - 30); d.setHours(0,0,0,0);
      return oDate >= d;
    } else if (dashboardFilter === 'year') {
      return oDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const filteredBatches = batches.filter(b => {
    if (dashboardFilter === 'all') return true;
    const bDate = new Date(b.createdAt);
    const now = new Date();
    if (dashboardFilter === 'today') {
      return bDate >= new Date(now.setHours(0,0,0,0));
    } else if (dashboardFilter === 'week') {
      const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0);
      return bDate >= d;
    } else if (dashboardFilter === 'month') {
      const d = new Date(); d.setDate(d.getDate() - 30); d.setHours(0,0,0,0);
      return bDate >= d;
    } else if (dashboardFilter === 'year') {
      return bDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Filtered Stat Card Metrics
  const totalFilteredOrders = filteredOrders.length;
  
  const preparingBatches = filteredBatches.filter(b => b.status === 'preparing');
  const mealsPreparing = preparingBatches.reduce((sum, b) => sum + (b.quantity || 0), 0);
  
  const readyOrders = filteredOrders.filter(o => o.status === 'ready');
  
  const filteredRevenue = filteredOrders.reduce((sum, o) => o.status !== 'cancelled' ? sum + (o.totalAmount || 0) : sum, 0);
  
  const lowStockItems = inventory.filter(item => item.quantity <= (item.minThreshold || 10));
  
  const activeBatches = batches.filter(b => b.status === 'pending' || b.status === 'preparing');

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // Chart Data
  const generateChartData = () => {
    if (dashboardFilter === 'today') {
      const hours = Array.from({ length: 22 }, (_, i) => {
        const hour = i + 1;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return { name: `${h12} ${ampm}`, hour, total: 0, completed: 0, cancelled: 0 };
      });
      filteredOrders.forEach(o => {
        const oHour = new Date(o.createdAt).getHours();
        const slot = hours.find(h => h.hour === oHour);
        if (slot) {
          slot.total += 1;
          if (o.status === 'delivered') slot.completed += 1;
          if (o.status === 'cancelled') slot.cancelled += 1;
        }
      });
      return hours;
    } else if (dashboardFilter === 'week') {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return { date: d, name: d.toLocaleDateString('en-US', { weekday: 'short' }), total: 0, completed: 0, cancelled: 0 };
      });
      filteredOrders.forEach(o => {
        const oDate = new Date(o.createdAt);
        oDate.setHours(0, 0, 0, 0);
        const slot = days.find(d => d.date.getTime() === oDate.getTime());
        if (slot) {
          slot.total += 1;
          if (o.status === 'delivered' || o.status === 'completed') slot.completed += 1;
          if (o.status === 'cancelled') slot.cancelled += 1;
        }
      });
      return days.map(d => ({ name: d.name, total: d.total, completed: d.completed, cancelled: d.cancelled }));
    } else if (dashboardFilter === 'month') {
      const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        d.setHours(0, 0, 0, 0);
        return { date: d, name: d.getDate().toString(), total: 0, completed: 0, cancelled: 0 };
      });
      filteredOrders.forEach(o => {
        const oDate = new Date(o.createdAt);
        oDate.setHours(0, 0, 0, 0);
        const slot = days.find(d => d.date.getTime() === oDate.getTime());
        if (slot) {
          slot.total += 1;
          if (o.status === 'delivered' || o.status === 'completed') slot.completed += 1;
          if (o.status === 'cancelled') slot.cancelled += 1;
        }
      });
      return days.map(d => ({ name: d.name, total: d.total, completed: d.completed, cancelled: d.cancelled }));
    } else {
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(new Date().getFullYear(), i, 1);
        return { month: i, name: d.toLocaleDateString('en-US', { month: 'short' }), total: 0, completed: 0, cancelled: 0 };
      });
      filteredOrders.forEach(o => {
        const oDate = new Date(o.createdAt);
        const slot = months.find(m => m.month === oDate.getMonth());
        if (slot) {
          slot.total += 1;
          if (o.status === 'delivered' || o.status === 'completed') slot.completed += 1;
          if (o.status === 'cancelled') slot.cancelled += 1;
        }
      });
      return months.map(m => ({ name: m.name, total: m.total, completed: m.completed, cancelled: m.cancelled }));
    }
  };
  const chartData = generateChartData();
  const hasChartData = chartData.some(d => d.total > 0);

  const fmt = (n: number) => n < 10 ? `0${n}` : `${n}`;

  // --- New Widgets Data ---
  const statusCounts = { pending: 0, preparing: 0, ready: 0, delivered: 0, cancelled: 0 };
  filteredOrders.forEach(o => {
    if (o.status === 'completed') statusCounts.delivered++;
    else if (statusCounts[o.status as keyof typeof statusCounts] !== undefined) statusCounts[o.status as keyof typeof statusCounts]++;
    else statusCounts.pending++;
  });
  const orderStatusData = [
    { name: 'Pending', value: statusCounts.pending, color: '#3b82f6' },
    { name: 'Preparing', value: statusCounts.preparing, color: '#f59e0b' },
    { name: 'Ready', value: statusCounts.ready, color: '#10b981' },
    { name: 'Delivered', value: statusCounts.delivered, color: '#6366f1' },
    { name: 'Cancelled', value: statusCounts.cancelled, color: '#f43f5e' }
  ];

  const mealSales: Record<string, { count: number, revenue: number }> = {};
  filteredOrders.forEach(o => {
    if (o.status !== 'cancelled') {
      o.items?.forEach((item: any) => {
        const mealName = item.mealId?.name || item.name || 'Unknown Meal';
        if (!mealSales[mealName]) mealSales[mealName] = { count: 0, revenue: 0 };
        mealSales[mealName].count += (item.quantity || 1);
        mealSales[mealName].revenue += (item.price || 0) * (item.quantity || 1);
      });
    }
  });
  const topSellingMeals = Object.entries(mealSales)
    .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 text-[13px]">
          <p className="font-medium text-black mb-2">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 mb-0.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-black/70">{entry.name}:</span>
              <span className="font-medium text-black">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
     return (
       <div className="flex justify-center items-center h-[60vh]">
         <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
       </div>
     )
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-16 font-sans w-full">
      
      {/* HEADER */}
      <div className="flex flex-row items-center sm:items-end justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-black tracking-tight mb-1">
            Overview
          </h1>
          <p className="text-base text-black/80 font-medium hidden md:block">
            Real-time insights and kitchen operations monitor.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-slate-200 text-black/80 font-medium text-[13px] py-2.5 pl-3 pr-8 rounded-lg focus:outline-none focus:border-slate-300 cursor-pointer transition-colors"
              value={dashboardFilter}
              onChange={(e) => setDashboardFilter(e.target.value as any)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown className="w-4 h-4 text-black/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-sky-100/50 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-auto sm:h-auto rounded-full bg-sky-100 sm:bg-transparent flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 sm:w-8 sm:h-8 text-sky-500" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] sm:text-[13px] text-black/70 sm:text-black font-medium uppercase tracking-wider mb-1">Orders</p>
            <h3 className="text-2xl font-medium text-black leading-none">{fmt(totalFilteredOrders)}</h3>
          </div>
        </div>
        <div className="bg-amber-100/50 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-auto sm:h-auto rounded-full bg-amber-100 sm:bg-transparent flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 sm:w-8 sm:h-8 text-amber-500" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] sm:text-[13px] text-black/70 sm:text-black font-medium uppercase tracking-wider mb-1">Meals Preparing</p>
            <h3 className="text-2xl font-medium text-black leading-none">{fmt(mealsPreparing)}</h3>
          </div>
        </div>
        <div className="bg-teal-100/50 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-auto sm:h-auto rounded-full bg-teal-100 sm:bg-transparent flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 sm:w-8 sm:h-8 text-teal-500" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] sm:text-[13px] text-black/70 sm:text-black font-medium uppercase tracking-wider mb-1">Ready to Dispatch</p>
            <h3 className="text-2xl font-medium text-black leading-none">{fmt(readyOrders.length)}</h3>
          </div>
        </div>
        <div className="bg-violet-100/50 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-auto sm:h-auto rounded-full bg-violet-100 sm:bg-transparent flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 sm:w-8 sm:h-8 text-violet-500" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] sm:text-[13px] text-black/70 sm:text-black font-medium uppercase tracking-wider mb-1">Revenue</p>
            <h3 className="text-2xl font-medium text-black leading-none">₹{filteredRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Orders Overview Chart */}
          <div className="bg-white rounded-lg p-6 border border-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-black text-xl">Orders Overview</h3>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                <span className="text-[13px] text-black/70 font-medium">Total Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                <span className="text-[13px] text-black/70 font-medium">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                <span className="text-[13px] text-black/70 font-medium">Cancelled</span>
              </div>
            </div>
            
            <div className="h-[280px] w-full">
              {hasChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} interval={dashboardFilter === 'today' ? 2 : 0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="total" name="Total Orders" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6', stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="completed" name="Completed" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: '#22c55e', stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: '#f97316', stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="w-10 h-10 text-black/15 mb-3" />
                  <p className="text-sm font-medium text-black/40">No orders recorded yet</p>
                  <p className="text-xs text-black/30 mt-1">{dashboardFilter === 'today' ? 'Orders will appear here as they come in today.' : 'No orders in this period.'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Only: Order Status Donut Chart */}
          <div className="block lg:hidden">
            <OrderStatusChart data={orderStatusData} />
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-slate-200/60 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-medium text-black text-base">Recent Orders</h3>
              <Link href="/orders" className="text-xs font-medium text-brand hover:underline">View All</Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-black/40">No orders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map(o => (
                  <div key={o._id} className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center hover:bg-slate-50/60 transition-colors">
                    <div className="col-span-3 sm:col-span-2">
                      <span className="text-[13px] font-medium text-brand">#{o._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="col-span-4 sm:col-span-4 min-w-0">
                      <span className="text-[13px] font-medium text-black truncate block">{o.parentId?.name || 'Unknown'}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-[13px] text-black/70 font-medium">{o.items?.length || 0} {(o.items?.length || 0) === 1 ? 'item' : 'items'}</span>
                    </div>
                    <div className="col-span-3 sm:col-span-3 flex justify-end">
                      <span className={`inline-block text-[11px] px-2.5 py-1 rounded-full font-medium capitalize ${
                        o.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 
                        o.status === 'preparing' ? 'bg-blue-100 text-blue-700' : 
                        o.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-700' :
                        o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        o.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {o.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Selling Meals */}
          <div className="bg-white rounded-lg border border-slate-200/60 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-medium text-black text-base">Top Selling Meals</h3>
            </div>
            
            {topSellingMeals.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-black/40">No sales data available.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topSellingMeals.map((meal, idx) => (
                  <div key={idx} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <span className="text-[13px] font-medium text-black truncate">{meal.name}</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[13px] font-medium text-black">{meal.count} sold</span>
                      <span className="text-[11px] font-medium text-black/50">₹{meal.revenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Desktop Only: Order Status Donut Chart */}
          <div className="hidden lg:block">
            <OrderStatusChart data={orderStatusData} />
          </div>
          
          {/* Active Batches */}
          <div className="bg-white rounded-lg p-6 border border-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <h3 className="font-medium text-black text-base">Active Batches</h3>
              </div>
              <Link href="/cooking-batches" className="text-xs font-medium text-brand hover:underline">View All</Link>
            </div>

            <div className="space-y-3">
              {activeBatches.length === 0 ? (
                <p className="text-sm text-black/50 text-center py-4">No active batches right now.</p>
              ) : (
                activeBatches.slice(0, 3).map(b => (
                  <div key={b._id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UtensilsCrossed className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-black truncate">{b.mealId?.name || 'Unknown Meal'}</p>
                        <p className="text-[11px] text-black/50 font-medium">{b.quantity} meals</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-1 rounded-md shrink-0 capitalize ${
                      b.status === 'preparing' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-lg p-6 border border-slate-200/60">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-medium text-black text-base">Low Stock Alerts</h3>
               <Link href="/stock-management" className="text-xs font-medium text-brand hover:underline">Manage</Link>
             </div>
             
             <div className="space-y-3">
               {lowStockItems.length === 0 ? (
                 <p className="text-sm text-black/50 text-center py-4">Inventory levels are healthy.</p>
               ) : (
                 lowStockItems.slice(0, 4).map(item => (
                   <div key={item._id} className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-lg border border-rose-100/50">
                     <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                       <AlertTriangle className="w-3.5 h-3.5" />
                     </div>
                     <div className="min-w-0">
                       <p className="text-sm font-medium text-black truncate">{item.name}</p>
                       <p className="text-[11px] font-medium text-rose-600">{item.quantity} {item.unit} left</p>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
