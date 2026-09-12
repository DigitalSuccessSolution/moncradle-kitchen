"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Play, MoreVertical, ChevronDown, Filter, Search, CheckCircle2, Clock, ShieldCheck, X, Calendar, Eye, Info, ClipboardList, Truck, Package, Timer, MapPin, Phone } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export interface KitchenOrder {
  id: string;
  parentName: string;
  babyName?: string;
  babyAgeInMonths?: number;
  babyAllergies?: string[];
  items: { name: string; quantity: number; category?: string; timeSlot?: string }[];
  status: string;
  deliveryAddress: {
    name?: string;
    flat?: string;
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    phone: string;
  };
  specialInstructions?: string;
  totalAmount: number;
  cancellationReason?: string;
  cancelledByRole?: string;
  cancelledBy?: any;
  packagingProofImageUrl?: string;
  createdAt: string;
  isSubscription?: boolean;
}

const formatOrderDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export default function IncomingOrdersPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [orderForProof, setOrderForProof] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const fetchOrders = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      // Fetch without auth token or with a dummy admin token if you prefer, 
      // but according to standard, we'll try to fetch with whatever token is in localStorage.
      const token = localStorage.getItem("moncradel_kitchen_token") || "";
      const response = await axios.get(`${apiUrl}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const sortedData = response.data.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const backendOrders = sortedData.map((o: any) => {
        let parentName = "Unknown";
        if (o.parentId && o.parentId.name) parentName = o.parentId.name;

        let babyName = undefined;
        let babyAgeInMonths = undefined;
        let babyAllergies: string[] = [];
        if (o.babyId) {
          babyName = o.babyId.name;
          babyAgeInMonths = o.babyId.ageInMonths;
          babyAllergies = o.babyId.allergies || [];
        }

        const mappedItems = (o.items || []).map((item: any) => {
          const name = item.mealId?.name || item.productId?.name || "Unknown Item";
          const category = item.mealId?.category || "";
          const timeSlot = item.timeSlot || "";
          return { name, quantity: item.quantity || 1, category, timeSlot };
        });

        const itemInstructions = (o.items || []).map((i: any) => i.specialInstructions).filter(Boolean).join(' | ');
        const combinedInstructions = [o.specialInstructions, itemInstructions].filter(Boolean).join(' | ');

        return {
          id: o._id,
          parentName,
          babyName,
          babyAgeInMonths,
          babyAllergies,
          items: mappedItems,
          status: o.status,
          deliveryAddress: {
            name: o.deliveryAddress?.name || parentName,
            flat: o.deliveryAddress?.flat || "",
            street: o.deliveryAddress?.street || "",
            city: o.deliveryAddress?.city || "",
            state: o.deliveryAddress?.state || "",
            zipCode: o.deliveryAddress?.zipCode || "",
            phone: o.deliveryAddress?.phone || o.parentId?.phone || ""
          },
          specialInstructions: combinedInstructions || "",
          totalAmount: o.totalAmount || 0,
          cancellationReason: o.cancellationReason || undefined,
          cancelledByRole: o.cancelledByRole || undefined,
          cancelledBy: o.cancelledBy || undefined,
          packagingProofImageUrl: o.packagingProofImageUrl || undefined,
          createdAt: o.createdAt,
          isSubscription: !!o.mealSubscriptionId
        };
      });

      // Show latest first
      setOrders(backendOrders);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      // Fallback for development if unauthorized or CORS (since login isn't fully integrated yet)
      setError("Failed to fetch orders from backend. Make sure the backend is running and you are logged in.");
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string, cancelReason?: string, proofFile?: File | null) => {
    // Check kitchen open status if they are accepting/preparing an order
    if (newStatus === "preparing" || newStatus === "ready") {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("moncradel_kitchen_token") || "";
        const res = await axios.get(`${apiUrl}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const isKitchenOpen = res.data?.profile?.isOpen;
        if (!isKitchenOpen) {
          Swal.fire({
            title: 'Kitchen Closed!',
            text: "Please turn your kitchen status to 'Currently Open' in the Profile page before accepting or updating orders.",
            icon: 'warning',
            confirmButtonColor: '#ea580c',
            confirmButtonText: 'Got it',
            customClass: {
              popup: 'rounded-2xl font-sans',
              confirmButton: 'rounded-xl font-medium shadow-sm'
            }
          });
          return; // Prevent update
        }
      } catch (e) {
        console.error("Failed to check kitchen status", e);
      }
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || "";

      let dataPayload: any;
      let headers: any = { Authorization: `Bearer ${token}` };

      if (proofFile) {
        dataPayload = new FormData();
        dataPayload.append('status', newStatus);
        if (cancelReason) dataPayload.append('cancellationReason', cancelReason);
        dataPayload.append('proof', proofFile);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        dataPayload = { status: newStatus };
        if (cancelReason) {
          dataPayload.cancellationReason = cancelReason;
        }
      }

      const response = await axios.patch(`${apiUrl}/orders/${orderId}/status`, dataPayload, {
        headers
      });

      // If order was cancelled/declined, show toast and refresh list so it removes from this kitchen's active pool
      if (newStatus === 'cancelled') {
        Swal.fire({
          icon: 'success',
          title: response.data?.message || 'Order cancelled successfully',
          timer: 2200,
          showConfirmButton: false,
          customClass: { popup: 'rounded-2xl font-sans' }
        });
        setSelectedOrder(null);
        fetchOrders();
      } else {
        const updatedCancelledByRole = undefined;
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, cancellationReason: cancelReason, cancelledByRole: updatedCancelledByRole || o.cancelledByRole, packagingProofImageUrl: response.data.data?.packagingProofImageUrl || o.packagingProofImageUrl } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus, cancellationReason: cancelReason, cancelledByRole: updatedCancelledByRole || selectedOrder.cancelledByRole, packagingProofImageUrl: response.data.data?.packagingProofImageUrl || selectedOrder.packagingProofImageUrl });
        }
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err?.response?.data?.message || 'Failed to update order status.',
        customClass: { popup: 'rounded-2xl font-sans' }
      });
    }
  };

  const handleDeclineOrder = (orderId: string) => {
    Swal.fire({
      title: 'Decline Order',
      text: 'Declining will forward this order to other available kitchens.',
      input: 'text',
      inputLabel: 'Reason for declining:',
      inputPlaceholder: 'e.g. Kitchen busy, ingredients out of stock...',
      showCancelButton: true,
      confirmButtonText: 'Decline & Forward',
      confirmButtonColor: '#e11d48', // rose-600
      cancelButtonColor: '#94a3b8', // slate-400
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Please provide a reason to decline!';
        }
      },
      customClass: {
        popup: 'rounded-2xl font-sans',
        confirmButton: 'rounded-xl font-medium shadow-sm',
        cancelButton: 'rounded-xl font-medium shadow-sm',
        input: 'rounded-xl focus:ring-rose-500 focus:border-rose-500'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updateOrderStatus(orderId, 'cancelled', result.value.trim());
      }
    });
  };

  const handleCancelOrder = (orderId: string) => {
    Swal.fire({
      title: 'Cancel Order',
      text: 'This order is already being prepared. Are you sure you want to cancel it?',
      input: 'text',
      inputLabel: 'Reason for cancellation:',
      inputPlaceholder: 'Type reason for cancellation...',
      showCancelButton: true,
      confirmButtonText: 'Cancel Order',
      confirmButtonColor: '#e11d48', // rose-600
      cancelButtonColor: '#94a3b8', // slate-400
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Please provide a reason to cancel the order!';
        }
      },
      customClass: {
        popup: 'rounded-2xl font-sans',
        confirmButton: 'rounded-xl font-medium shadow-sm',
        cancelButton: 'rounded-xl font-medium shadow-sm',
        input: 'rounded-xl focus:ring-rose-500 focus:border-rose-500'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updateOrderStatus(orderId, 'cancelled', result.value.trim());
      }
    });
  };


  const tabs = ['All', 'pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>;
      case 'preparing': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Preparing</span>;
      case 'ready': return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">Ready</span>;
      case 'out_for_delivery': return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Out for Delivery</span>;
      case 'delivered': return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Delivered</span>;
      case 'cancelled': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Cancelled</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">{status?.replace('_', ' ')}</span>;
    }
  };

  let filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.babyName && o.babyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      o.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter =
      selectedFilter === "all" ||
      o.status === selectedFilter;

    let matchesDate = true;
    if (dateFilter !== 'All Time' && o.createdAt) {
      const oDate = new Date(o.createdAt);
      const now = new Date();
      if (dateFilter === 'Today') {
        matchesDate = oDate >= new Date(now.setHours(0, 0, 0, 0));
      } else if (dateFilter === 'Last 7 Days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        d.setHours(0, 0, 0, 0);
        matchesDate = oDate >= d;
      } else if (dateFilter === 'This Month') {
        matchesDate = oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
      }
    }

    return matchesSearch && matchesFilter && matchesDate;
  });

  // Reset load more when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [searchTerm, selectedFilter, dateFilter]);

  const totalItems = filteredOrders.length;
  const paginatedOrders = filteredOrders.slice(0, visibleCount);

  return (
    <>
      <div className="space-y-6 animate-fade-in-up pb-16 font-sans w-full">

        {/* 1. Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">
              Order Management
            </h1>
            <p className="text-sm text-gray-500 font-medium hidden md:block">
              Real-time management of infant meal preparation and kitchen queue.
            </p>
            {error && <p className="text-sm text-rose-500 font-medium mt-2">⚠ {error}</p>}
          </div>
        </div>

        {/* 2. Top Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-blue-100/50 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-auto sm:h-auto rounded-full bg-blue-100 sm:bg-transparent flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-[11px] sm:text-[13px] text-black/70 sm:text-black font-medium uppercase tracking-wider mb-1">Orders Queued</p>
              <h3 className="text-2xl font-medium text-black leading-none">{orders.filter(o => o.status === 'pending').length < 10 ? `0${orders.filter(o => o.status === 'pending').length}` : orders.filter(o => o.status === 'pending').length}</h3>
            </div>
          </div>
          <div className="bg-orange-100/50 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-auto sm:h-auto rounded-full bg-orange-100 sm:bg-transparent flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 sm:w-8 sm:h-8 text-orange-500" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-[11px] sm:text-[13px] text-black/70 sm:text-black font-medium uppercase tracking-wider mb-1">In Preparation</p>
              <h3 className="text-2xl font-medium text-black leading-none">{orders.filter(o => o.status === 'preparing').length < 10 ? `0${orders.filter(o => o.status === 'preparing').length}` : orders.filter(o => o.status === 'preparing').length}</h3>
            </div>
          </div>
          <div className="bg-emerald-100/50 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-auto sm:h-auto rounded-full bg-emerald-100 sm:bg-transparent flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-500" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-[11px] sm:text-[13px] text-black/70 sm:text-black font-medium uppercase tracking-wider mb-1">Ready for Pickup</p>
              <h3 className="text-2xl font-medium text-black leading-none">{orders.filter(o => o.status === 'ready').length < 10 ? `0${orders.filter(o => o.status === 'ready').length}` : orders.filter(o => o.status === 'ready').length}</h3>
            </div>
          </div>
          <div className="bg-indigo-100/50 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-auto sm:h-auto rounded-full bg-indigo-100 sm:bg-transparent flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5 sm:w-8 sm:h-8 text-indigo-500" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-[11px] sm:text-[13px] text-black/70 sm:text-black font-medium uppercase tracking-wider mb-1">Total Orders</p>
              <h3 className="text-2xl font-medium text-black leading-none">{orders.length < 10 ? `0${orders.length}` : orders.length}</h3>
            </div>
          </div>
        </div>

        {/* 3. Status Tabs (Admin Style) */}
        <div className="flex gap-4 shrink-0 overflow-x-auto pb-1 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setSelectedFilter(tab === 'All' ? 'all' : tab); setVisibleCount(10); }}
              className={`pb-2.5 font-medium text-sm border-b-2 transition-colors whitespace-nowrap capitalize ${
                (selectedFilter === 'all' && tab === 'All') || selectedFilter === tab
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.replaceAll('_', ' ')}
            </button>
          ))}
        </div>

        {/* 4. Table Card Container (Admin Style) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Controls Bar */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-50 shrink-0">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Order ID or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="All Time">All Time</option>
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
          </div>

          {/* DESKTOP TABLE (Admin Layout) */}
          <div className="hidden md:block overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
                <p className="text-sm text-gray-500">We couldn't find any orders matching your current filters.</p>
                <button 
                  onClick={() => { setSearchTerm(""); setSelectedFilter("all"); setDateFilter("All Time"); }} 
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-white text-gray-900 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 font-semibold border-b border-gray-200">Order ID</th>
                    <th className="px-6 py-4 font-semibold border-b border-gray-200">Customer</th>
                    <th className="px-6 py-4 font-semibold border-b border-gray-200">Items</th>
                    <th className="px-6 py-4 font-semibold border-b border-gray-200">Total</th>
                    <th className="px-6 py-4 font-semibold border-b border-gray-200">Delivery Area</th>
                    <th className="px-6 py-4 font-semibold border-b border-gray-200">Status</th>
                    <th className="px-6 py-4 font-semibold border-b border-gray-200">Date</th>
                    <th className="px-6 py-4 font-semibold text-right border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-blue-600">
                        <div className="flex flex-col items-start gap-1">
                          <span 
                            className="cursor-pointer hover:underline" 
                            onClick={() => setSelectedOrder(order)}
                            title={order.id}
                          >
                            #{order.id.substring(order.id.length - 6).toUpperCase()}
                          </span>
                          {order.isSubscription && (
                            <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                              SUB
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>{order.parentName}</span>
                          {order.babyName && (
                            <span className="text-xs text-gray-500 font-normal">Baby {order.babyName}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 truncate max-w-xs text-gray-700">
                        {order.items.map(i => `${i.quantity}x ${i.name} ${i.category ? `(${i.category})` : ''} ${i.timeSlot ? `[${i.timeSlot}]` : ''}`).join(', ')}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ₹{order.totalAmount}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {order.deliveryAddress.city}{order.deliveryAddress.zipCode ? `, ${order.deliveryAddress.zipCode}` : ''}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 bg-gray-50 rounded-md transition-colors inline-flex items-center justify-center"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Load More Footer (Desktop) */}
            {filteredOrders.length > visibleCount && (
              <div className="border-t border-gray-200 p-4 flex justify-center bg-gray-50">
                <button
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="px-6 py-2 text-sm font-medium text-blue-600 border border-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Load More Orders
                </button>
              </div>
            )}
          </div>

          {/* MOBILE CARDS (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center bg-white">
                <Search className="w-8 h-8 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
                <button 
                  onClick={() => { setSearchTerm(""); setSelectedFilter("all"); setDateFilter("All Time"); }} 
                  className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              paginatedOrders.map(ord => (
                <div key={`mob-${ord.id}`} className="bg-white p-4 flex flex-col gap-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600">#{ord.id.substring(ord.id.length - 6).toUpperCase()}</span>
                      {ord.isSubscription && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">SUB</span>}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {formatOrderDate(ord.createdAt)}
                    </span>
                  </div>
                  {/* Card Body */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{ord.parentName}</span>
                      {ord.babyName && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-500">Baby {ord.babyName}</span>
                          {ord.babyAllergies && ord.babyAllergies.length > 0 && (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">ALLERGY</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-sm font-semibold text-gray-900">₹{ord.totalAmount}</span>
                      <span className="text-xs text-gray-500">{ord.items?.length || 0} {(ord.items?.length || 0) === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 truncate">
                    {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>

                  {ord.specialInstructions && (
                    <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200/50">
                      <span className="text-rose-500 text-xs mt-0.5">⚠</span>
                      <span className="text-xs font-medium text-amber-900">{ord.specialInstructions}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div>{getStatusBadge(ord.status)}</div>
                    <button 
                      onClick={() => setSelectedOrder(ord)} 
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-blue-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                  </div>
                </div>
              ))
            )}
            {/* Load More Footer (Mobile) */}
            {filteredOrders.length > visibleCount && (
              <div className="p-4 flex justify-center bg-gray-50">
                <button
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="w-full py-2.5 text-sm font-medium text-blue-600 border border-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Load More Orders
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ORDER DETAILS MODAL */}
      {mounted && selectedOrder && createPortal(
        <div className="order-details-portal">
          {/* Fixed Full-Screen Backdrop */}
          <div
            className="fixed inset-0 bg-[#0B1727]/70 z-[99998] animate-fade-in"
            style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            onClick={() => setSelectedOrder(null)}
          ></div>

          {/* Modal Container */}
          <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
            <div className="relative bg-white sm:rounded-lg w-full max-w-[100vw] sm:max-w-xl h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl border-0 sm:border border-slate-200 pointer-events-auto flex flex-col rounded-t-2xl sm:rounded-b-lg">
              {/* Modal Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium text-brand" title={selectedOrder.id}>
                    #{selectedOrder.id.length > 6 ? selectedOrder.id.slice(-6).toUpperCase() : selectedOrder.id.toUpperCase()}
                  </h2>
                  {selectedOrder.isSubscription && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide">SUBSCRIPTION</span>}
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-black/50 hover:text-black/70 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-5 flex-1">

                {/* Customer Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex flex-col">
                    <p className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Customer / Parent</p>
                    <p className="text-[17px] font-semibold text-gray-900">{selectedOrder.parentName}</p>
                    {selectedOrder.babyName && (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[14px] font-medium text-gray-800">Baby {selectedOrder.babyName} {selectedOrder.babyAgeInMonths ? `(${selectedOrder.babyAgeInMonths} mos)` : ''}</p>
                        {selectedOrder.babyAllergies && selectedOrder.babyAllergies.length > 0 && (
                          <p className="text-[13px] text-rose-600 font-medium flex items-center gap-1">
                            ⚠ Allergies: {selectedOrder.babyAllergies.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:text-right">
                    <p className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Order Details</p>
                    <p className="text-[17px] font-semibold text-emerald-600">₹{selectedOrder.totalAmount}</p>
                    <p className="text-[13px] text-gray-500 mt-1 flex items-center sm:justify-end gap-1.5 font-normal">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {formatOrderDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="pt-2">
                  <p className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider mb-3">Order Items</p>
                  <div className="flex flex-col gap-2.5">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[15px] font-medium text-gray-900">
                        <div className="flex flex-col pr-4">
                          <span>{item.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.category && <span className="text-[12px] text-gray-500 capitalize font-medium">{item.category}</span>}
                            {item.timeSlot && <span className="text-[11px] text-brand bg-brand/10 px-1.5 py-0.5 rounded capitalize font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {item.timeSlot}</span>}
                          </div>
                        </div>
                        <span className="text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-md mt-0.5">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider">
                        Delivery Address
                      </span>
                    </div>
                    {selectedOrder.deliveryAddress?.phone && (
                      <a 
                        href={`tel:${selectedOrder.deliveryAddress.phone}`}
                        className="text-[12px] font-semibold text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full"
                      >
                        <Phone className="w-3 h-3" />
                        {selectedOrder.deliveryAddress.phone}
                      </a>
                    )}
                  </div>

                  <div className="pt-1 text-[14px] text-gray-900 space-y-1">
                    <p className="font-semibold text-[15px] text-gray-900">
                      {selectedOrder.deliveryAddress?.name || selectedOrder.parentName}
                    </p>
                    
                    <p className="text-gray-800 leading-relaxed font-normal">
                      {selectedOrder.deliveryAddress?.flat && (
                        <span className="font-medium">{selectedOrder.deliveryAddress.flat}, </span>
                      )}
                      <span>{selectedOrder.deliveryAddress?.street || 'No street provided'}</span>
                    </p>

                    <p className="text-gray-600 font-medium text-[13px]">
                      {[
                        selectedOrder.deliveryAddress?.city,
                        selectedOrder.deliveryAddress?.state,
                        selectedOrder.deliveryAddress?.zipCode ? `PIN: ${selectedOrder.deliveryAddress.zipCode}` : null
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className={`p-4 rounded-xl flex items-start gap-3 border ${selectedOrder.specialInstructions ? 'bg-amber-50/50 border-amber-200/60' : 'bg-gray-50/50 border-gray-100'}`}>
                  {selectedOrder.specialInstructions ? (
                    <span className="text-amber-600 text-lg leading-none mt-0.5">📝</span>
                  ) : (
                    <Info className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  )}
                  <div className="flex flex-col w-full">
                    <span className={`text-[12px] font-semibold uppercase tracking-wider mb-1 ${selectedOrder.specialInstructions ? 'text-amber-800' : 'text-gray-500'}`}>
                      Parent Note / Instructions
                    </span>
                    {selectedOrder.specialInstructions ? (
                      <span className="text-[15px] font-medium text-amber-900 leading-snug">{selectedOrder.specialInstructions}</span>
                    ) : (
                      <span className="text-[14px] font-medium text-gray-400 italic">No special instructions provided by parent.</span>
                    )}
                  </div>
                </div>

                {/* Packaging Proof */}
                {selectedOrder.packagingProofImageUrl && (
                  <div className="pt-2">
                    <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Packaging Proof</span>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer" onClick={() => window.open(selectedOrder.packagingProofImageUrl, '_blank')}>
                      <img src={selectedOrder.packagingProofImageUrl} alt="Packaging Proof" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                        <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Status & Progress */}
                <div className={`p-4 rounded-xl border ${selectedOrder.status === 'cancelled' ? 'bg-rose-50/50 border-rose-100' : 'bg-gray-50/50 border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-gray-900 uppercase tracking-wider">Current Status</span>
                    <span className={`inline-block text-[13px] px-3 py-1 rounded-full font-semibold capitalize ${selectedOrder.status === 'ready' || selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        selectedOrder.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          selectedOrder.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800' :
                            selectedOrder.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                      }`}>
                      {selectedOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                  {selectedOrder.status === 'cancelled' && (
                    <div className="pt-3 mt-3 border-t border-rose-100 bg-rose-50/60 p-3 rounded-xl border border-rose-200/50">
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <p className="text-[12px] text-rose-800/80 font-bold uppercase tracking-wider">Cancellation Info</p>
                        {selectedOrder.cancelledByRole && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-200/70 text-rose-800 uppercase tracking-wide">
                            Cancelled by {selectedOrder.cancelledByRole === 'parent' ? 'Customer' : selectedOrder.cancelledByRole === 'kitchen' ? 'Kitchen' : selectedOrder.cancelledByRole === 'admin' ? 'Admin / Support' : selectedOrder.cancelledByRole}
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] font-medium text-rose-900">
                        <span className="font-semibold text-rose-950">Reason: </span>
                        {selectedOrder.cancellationReason || 'No specific reason provided'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contextual Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3 mt-4">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <button onClick={() => handleDeclineOrder(selectedOrder.id)} className="flex-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 py-3 rounded-lg text-[15px] font-medium transition-colors">
                        Decline Order
                      </button>
                      <button onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')} className="flex-1 bg-brand hover:bg-brand-hover text-white py-3 rounded-lg text-[15px] font-medium transition-colors">
                        Accept & Start Prep
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <>
                      <button onClick={() => handleCancelOrder(selectedOrder.id)} className="flex-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 py-3 rounded-lg text-[15px] font-medium transition-colors">
                        Cancel Order
                      </button>
                      <button onClick={() => {
                        // setOrderForProof(selectedOrder.id);
                        // setShowProofModal(true);
                        // setProofFile(null);
                        // setProofPreviewUrl(null);
                        updateOrderStatus(selectedOrder.id, 'ready');
                      }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-[15px] font-medium transition-colors">
                        Mark as Ready
                      </button>
                    </>
                  )}
                  {(!['pending', 'preparing'].includes(selectedOrder.status)) && (
                    <button className="flex-1 bg-white border border-slate-200 text-black/70 hover:bg-slate-50 py-3 rounded-lg text-[15px] font-medium transition-colors" onClick={() => setSelectedOrder(null)}>
                      Close
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Proof of Packaging Modal */}
      {mounted && showProofModal && orderForProof && createPortal(
        <div className="fixed inset-0 z-[999999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => !isUploading && setShowProofModal(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Upload Packaging Photo</h3>
              <button onClick={() => !isUploading && setShowProofModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <p className="text-[14px] text-gray-600 mb-4">
                Please take a clear photo of the packaged meal. This ensures quality and helps resolve any delivery disputes.
              </p>

              {!proofPreviewUrl ? (
                <div className="border-2 border-dashed border-brand/30 rounded-xl bg-brand/5 p-6 flex flex-col items-center justify-center gap-3 relative">
                  <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-[14px] font-medium text-brand text-center">Tap to Open Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProofFile(file);
                        setProofPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200">
                    <img src={proofPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setProofFile(null);
                        setProofPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-6 mt-2">
                <button
                  disabled={isUploading || !proofFile}
                  onClick={async () => {
                    if (!proofFile || !orderForProof) return;
                    setIsUploading(true);
                    await updateOrderStatus(orderForProof, 'ready', undefined, proofFile);
                    setIsUploading(false);
                    setShowProofModal(false);
                    setProofFile(null);
                    setProofPreviewUrl(null);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3.5 rounded-xl text-[15px] font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Uploading & Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Submit & Mark Ready</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </>
  );
}
