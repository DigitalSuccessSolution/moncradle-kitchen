"use client";

import { useState, useEffect } from "react";
import { 
  Download, 
  FileSpreadsheet, 
  Package, 
  ShoppingBag,
  UtensilsCrossed,
  IndianRupee,
  Loader2,
  Calendar,
  ChevronDown,
  Star,
  Eye
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from "axios";

export default function ReportsPage() {
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("week");
  
  const [graphData, setGraphData] = useState<any[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [dateFilter]);

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || ""; 
      const headers = { Authorization: `Bearer ${token}` };

      const ordersRes = await axios.get(`${apiUrl}/orders`, { headers });
      const allOrders = ordersRes.data.data;
      
      const filteredOrders = filterByDate(allOrders, 'createdAt');
      
      // Process Data for Graph
      const processed = processGraphData(filteredOrders, dateFilter);
      setGraphData(processed);
      
    } catch (error) {
      console.error("Failed to load metrics", error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const filterByDate = (data: any[], dateField: string) => {
    if (dateFilter === 'all') return data;
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]).getTime();
      if (dateFilter === 'today') return itemDate >= startOfToday;
      if (dateFilter === 'week') return itemDate >= (startOfToday - 7 * 24 * 60 * 60 * 1000);
      if (dateFilter === 'month') return itemDate >= (startOfToday - 30 * 24 * 60 * 60 * 1000);
      return true;
    });
  };

  const processGraphData = (orders: any[], filter: string) => {
    if (orders.length === 0) return [];
    
    if (filter === 'today') {
      const hours = Array.from({ length: 12 }, (_, i) => {
        const hour = i + 8; // 8 AM to 7 PM
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour > 12 ? hour - 12 : hour;
        return { name: `${h12} ${ampm}`, orders: 0, revenue: 0, hour24: hour };
      });

      orders.forEach(o => {
        const h = new Date(o.createdAt).getHours();
        const slot = hours.find(x => x.hour24 === h);
        if (slot) {
          slot.orders += 1;
          if (o.status === 'completed' || o.status === 'delivered') {
            slot.revenue += (o.totalAmount || 0);
          }
        }
      });
      return hours;
    } 
    else if (filter === 'week' || filter === 'all') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => ({ name: d, orders: 0, revenue: 0 }));
      orders.forEach(o => {
        const d = new Date(o.createdAt).getDay();
        days[d].orders += 1;
        if (o.status === 'completed' || o.status === 'delivered') {
          days[d].revenue += (o.totalAmount || 0);
        }
      });
      return days;
    }
    else if (filter === 'month') {
      const weeks = [
        { name: 'Week 1', orders: 0, revenue: 0 },
        { name: 'Week 2', orders: 0, revenue: 0 },
        { name: 'Week 3', orders: 0, revenue: 0 },
        { name: 'Week 4+', orders: 0, revenue: 0 }
      ];
      orders.forEach(o => {
        const date = new Date(o.createdAt).getDate();
        let w = 0;
        if (date > 7 && date <= 14) w = 1;
        else if (date > 14 && date <= 21) w = 2;
        else if (date > 21) w = 3;
        
        weeks[w].orders += 1;
        if (o.status === 'completed' || o.status === 'delivered') {
          weeks[w].revenue += (o.totalAmount || 0);
        }
      });
      return weeks;
    }
    return [];
  };

  const handlePreview = async (reportId: string) => {
    setLoadingReport(reportId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || ""; 
      const headers = { Authorization: `Bearer ${token}` };
      
      let data: any[] = [];
      let title = "";

      if (reportId === 'inventory') {
        const res = await axios.get(`${apiUrl}/inventory`, { headers });
        data = res.data.data.map((i: any) => ({
          Name: i.name, Category: i.category, Qty: i.quantity, Unit: i.unit, Status: i.status
        }));
        title = "Inventory Report";
      } 
      else if (reportId === 'orders') {
        const res = await axios.get(`${apiUrl}/orders`, { headers });
        const filtered = filterByDate(res.data.data, 'createdAt');
        data = filtered.map((o: any) => ({
          Status: o.status, Amount: `₹${o.totalAmount || 0}`, Items: o.items?.length || 0, Customer: o.parentId?.name || 'Unknown'
        }));
        title = "Orders Report";
      }
      else if (reportId === 'batches') {
        const res = await axios.get(`${apiUrl}/batches`, { headers });
        const filtered = filterByDate(res.data.data, 'createdAt');
        data = filtered.map((b: any) => ({
          Meal: b.mealId?.name || 'Unknown', Qty: b.quantity, Status: b.status
        }));
        title = "Production Batches";
      }
      else if (reportId === 'revenue') {
        const res = await axios.get(`${apiUrl}/orders`, { headers });
        const filtered = filterByDate(res.data.data, 'createdAt');
        const completed = filtered.filter((o:any) => o.status === 'completed' || o.status === 'delivered');
        const revenue = completed.reduce((sum: number, o:any) => sum + (o.totalAmount || 0), 0);
        data = [{ Orders: completed.length, Revenue: `₹${revenue}` }];
        title = "Revenue Summary";
      }
      else if (reportId === 'reviews') {
        try {
          const res = await axios.get(`${apiUrl}/reviews`, { headers });
          const filtered = filterByDate(res.data.data, 'createdAt');
          data = filtered.map((r: any) => ({
             Rating: `${r.rating}/5`, Customer: r.userId?.name || 'Unknown'
          }));
          title = "Customer Feedback";
        } catch(e) {
          data = [];
        }
      }

      if (data.length === 0) {
        import("sweetalert2").then((Swal) => {
          Swal.default.fire("No Data", "No data available for the selected period.", "info");
        });
        return;
      }

      // Generate HTML Table
      const headersKeys = Object.keys(data[0]);
      let html = `<div style="max-height: 400px; overflow: auto; text-align: left;"><table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 14px;">`;
      html += `<thead><tr style="border-bottom: 2px solid #e2e8f0; background: #f8fafc;">`;
      headersKeys.forEach(h => html += `<th style="padding: 10px 12px; color: #475569;">${h}</th>`);
      html += `</tr></thead><tbody style="color: #0f172a;">`;
      data.forEach((row: any) => {
         html += `<tr style="border-bottom: 1px solid #f1f5f9;">`;
         headersKeys.forEach(h => html += `<td style="padding: 10px 12px;">${row[h]}</td>`);
         html += `</tr>`;
      });
      html += `</tbody></table></div>`;

      import("sweetalert2").then((Swal) => {
        Swal.default.fire({
          title: title,
          html: html,
          width: '90%',
          showCloseButton: true,
          confirmButtonText: 'Close',
          confirmButtonColor: '#000',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl'
          }
        });
      });

    } catch (error) {
      console.error("Preview failed", error);
      alert("Failed to load report preview. Make sure backend is running.");
    } finally {
      setLoadingReport(null);
    }
  };

  const reportsList = [
    {
      id: "orders",
      name: "Orders History Report",
      description: "Complete list of all orders, statuses, and customer details.",
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      id: "inventory",
      name: "Inventory Stock Level",
      description: "Current stock quantities, categories, and status of all ingredients.",
      icon: Package,
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      id: "batches",
      name: "Production & Batches",
      description: "Log of all active and completed kitchen cooking batches.",
      icon: UtensilsCrossed,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      id: "revenue",
      name: "Revenue & Sales Summary",
      description: "Financial overview based on completed and delivered orders.",
      icon: IndianRupee,
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      id: "reviews",
      name: "Customer Feedback Log",
      description: "Aggregated ratings, reviews, and feedback from parents.",
      icon: Star,
      color: "text-rose-500",
      bg: "bg-rose-50"
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['kitchen', 'admin', 'superadmin']}>
      <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
          <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-black/70">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Orders
            </span>
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-black/70">
              <div className="w-2.5 h-2.5 rounded-full bg-brand"></div> Revenue
            </span>
          </div>
        </div>
        
        <div className="h-[250px] sm:h-[280px] w-full min-w-0 -ml-2 sm:ml-0">
          {loadingMetrics ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          ) : graphData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FA5C2F" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FA5C2F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="orders" 
                  name="Total Orders"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue (₹)"
                  stroke="#FA5C2F" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-black/40 font-medium bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              No data available for this period.
            </div>
          )}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-[13px] text-black uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4 text-left font-medium">Report Type</th>
                <th className="px-6 py-4 text-left font-medium">Description</th>
                <th className="px-6 py-4 text-left font-medium">Format</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportsList.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-lg ${report.bg} flex items-center justify-center shrink-0`}>
                        <report.icon className={`w-5 h-5 ${report.color}`} strokeWidth={1.5} />
                      </div>
                      <span className="font-medium text-black text-[15px] block">
                        {report.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[14px] text-black/70 font-medium">
                      {report.description}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[12px] font-medium border border-slate-200">
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Table
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handlePreview(report.id)}
                      disabled={loadingReport === report.id}
                      className="bg-black hover:bg-black/80 disabled:bg-black/50 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      {loadingReport === report.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" /> Preview
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
