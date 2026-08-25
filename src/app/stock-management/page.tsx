"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Eye,
  Pencil,
  X,
  Trash2
} from "lucide-react";
import Swal from "sweetalert2";

export interface InventoryItem {
  _id: string;
  name: string;
  category: "Raw Material" | "Packaging" | "Other";
  quantity: number;
  unit: string;
  minThreshold: number;
  status: "Optimal" | "Low Stock" | "Critical";
  createdAt: string;
  updatedAt: string;
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);
  const [selectedItemForView, setSelectedItemForView] = useState<InventoryItem | null>(null);
  const [mounted, setMounted] = useState(false);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    name: "",
    category: "Raw Material",
    quantity: 0,
    unit: "kg",
    minThreshold: 10
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Raw Material",
      quantity: 0,
      unit: "kg",
      minThreshold: 10
    });
  };

  const fetchInventory = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || "";
      const res = await axios.get(`${apiUrl}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventoryList(res.data.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching inventory:", err);
      setError("Failed to fetch inventory from backend.");
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchInventory();
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddSubmit = async () => {
    if (!formData.name) return alert("Name is required");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || "";
      await axios.post(`${apiUrl}/inventory`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAddModalOpen(false);
      resetForm();
      fetchInventory();
    } catch (err: any) {
      alert("Failed to add inventory.");
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedItemForEdit) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || "";
      await axios.put(`${apiUrl}/inventory/${selectedItemForEdit._id}`, {
        name: selectedItemForEdit.name,
        category: selectedItemForEdit.category,
        quantity: selectedItemForEdit.quantity,
        unit: selectedItemForEdit.unit,
        minThreshold: selectedItemForEdit.minThreshold
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedItemForEdit(null);
      fetchInventory();
    } catch (err: any) {
      alert("Failed to update inventory.");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0B1727', // Brand dark
      cancelButtonColor: '#ef4444', // Rose-500
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-5 py-2.5 rounded-lg text-sm font-semibold',
        cancelButton: 'px-5 py-2.5 rounded-lg text-sm font-semibold'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || "";
      await axios.delete(`${apiUrl}/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedItemForView(null);
      fetchInventory();
      Swal.fire({
        title: 'Deleted!',
        text: 'Item has been deleted successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-5 py-2.5 rounded-lg text-sm font-semibold'
        }
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete inventory item.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-5 py-2.5 rounded-lg text-sm font-semibold'
        }
      });
    }
  };

  const filteredItems = inventoryList.filter(
    (i) => i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = inventoryList.length;
  const lowStockCount = inventoryList.filter(i => i.status === "Low Stock" || i.status === "Critical").length;

  return (
    <div className="space-y-6 animate-fade-in-up pb-16 max-w-2xl mx-auto lg:max-w-none lg:mx-0 font-sans">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-medium text-black tracking-tight mb-1 whitespace-nowrap truncate">
            Inventory & Stock Control
          </h1>
          <p className="text-base text-black/80 font-medium hidden md:block">
            Monitor raw materials, packaging, and kitchen supplies.
          </p>
          {error && <p className="text-sm text-rose-500 font-medium mt-2">⚠ {error}</p>}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-[14px] text-black placeholder-black/30 focus:outline-none focus:border-brand"
            />
          </div>

          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="bg-brand hover:bg-brand-hover text-white font-medium text-[14px] px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-sky-100/50 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-auto sm:h-auto rounded-full bg-sky-100 sm:bg-transparent flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 sm:w-8 sm:h-8 text-sky-500" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] sm:text-[13px] text-black/70 sm:text-black font-medium sm:font-medium uppercase tracking-wider mb-1">Total Items</p>
            <h3 className="text-2xl font-medium text-black leading-none">{totalItems < 10 ? `0${totalItems}` : totalItems}</h3>
          </div>
        </div>

        <div className="bg-rose-100/50 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-auto sm:h-auto rounded-full bg-rose-100 sm:bg-transparent flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-8 sm:h-8 text-rose-500" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] sm:text-[13px] text-black/70 sm:text-black font-medium sm:font-medium uppercase tracking-wider mb-1">Low / Critical</p>
            <h3 className="text-2xl font-medium text-black leading-none">{lowStockCount < 10 ? `0${lowStockCount}` : lowStockCount}</h3>
          </div>
        </div>
      </div>

      {/* 3. Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-black">Inventory Items</h2>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              {searchTerm ? <Search className="w-8 h-8 text-gray-400" /> : <Package className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-[17px] font-semibold text-gray-900 mb-1">
              {searchTerm ? "No matching items found" : "Inventory is empty"}
            </h3>
            <p className="text-[14px] text-gray-500 max-w-sm mb-5">
              {searchTerm 
                ? `We couldn't find anything matching "${searchTerm}". Try another search term.` 
                : "Get started by adding your first raw material, packaging, or kitchen supply."}
            </p>
            {searchTerm ? (
              <button 
                onClick={() => setSearchTerm("")} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[14px] px-5 py-2.5 rounded-lg transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <button 
                onClick={() => { resetForm(); setIsAddModalOpen(true); }} 
                className="bg-brand hover:bg-brand-hover text-white font-semibold text-[14px] px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Add First Item
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
              {filteredItems.map((item) => {
                const isLow = item.status === "Low Stock";
                const isCritical = item.status === "Critical";

                return (
                  <div
                    key={`mob-${item._id}`}
                    className="bg-white rounded-lg p-5 border border-slate-200/80 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 relative shrink-0 bg-slate-50">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=F1F5F9&color=64748B&size=128`}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                            {item.name}
                          </h3>
                          <p className="text-[13px] font-medium text-gray-500 mt-0.5 truncate">
                            {item.category}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isCritical
                            ? "bg-rose-100 text-rose-800 border-none"
                            : isLow
                            ? "bg-amber-100 text-amber-800 border-none"
                            : "bg-emerald-100 text-emerald-800 border-none"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[12px] text-gray-500 font-semibold">Stock Level</span>
                        <span className={`text-[15px] font-semibold ${isCritical || isLow ? "text-rose-600" : "text-gray-900"}`}>
                          {item.quantity} <span className="text-gray-500 text-[13px]">{item.unit}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedItemForView(item)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand hover:border-brand hover:bg-slate-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSelectedItemForEdit(item)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand hover:border-brand hover:bg-slate-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="w-8 h-8 rounded-lg border border-rose-200 flex items-center justify-center text-rose-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg border border-slate-200/80 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-[13px] font-semibold text-gray-600 uppercase tracking-wider items-center">
                <div className="col-span-4 pl-2">Item Details</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Stock Level</div>
                <div className="col-span-2 text-right pr-2">Actions</div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isLow = item.status === "Low Stock";
                  const isCritical = item.status === "Critical";
                  
                  return (
                    <div key={`table-${item._id}`} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/60 transition-colors group">
                      <div className="col-span-4 pl-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 relative shrink-0 bg-white">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=F1F5F9&color=64748B&size=128`}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-gray-900 text-[15px] truncate block">{item.name}</span>
                        </div>
                      </div>

                      <div className="col-span-2 min-w-0 pr-2">
                        <span className="text-[14px] text-gray-600 font-medium truncate block">
                          {item.category}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className={`inline-block text-[12px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                          isCritical ? "bg-rose-100 text-rose-800" : isLow ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className={`font-semibold text-[15px] ${isCritical || isLow ? "text-rose-600" : "text-gray-900"}`}>
                          {item.quantity}
                        </span>
                        <span className="text-gray-500 text-[13px] ml-1">{item.unit}</span>
                      </div>

                      <div className="col-span-2 flex justify-end pr-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedItemForView(item)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand hover:border-brand hover:bg-slate-50 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => setSelectedItemForEdit(item)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand hover:border-brand hover:bg-slate-50 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="w-8 h-8 rounded-lg border border-rose-200 flex items-center justify-center text-rose-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Modal */}
      {mounted && isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-md h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-[18px] font-semibold text-gray-900">Add New Inventory</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Item Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand" placeholder="e.g. Organic Carrots" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Quantity</label>
                  <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Unit</label>
                  <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand bg-white">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                    <option value="Units">Units</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand bg-white">
                    <option value="Raw Material">Raw Material</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Min Threshold</label>
                  <input type="number" value={formData.minThreshold} onChange={e => setFormData({...formData, minThreshold: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand" />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold text-[15px] py-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAddSubmit} className="flex-1 bg-brand text-white font-semibold text-[15px] py-3 rounded-xl shadow-sm hover:shadow hover:bg-brand-hover transition-all cursor-pointer">
                Save Item
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Modal */}
      {mounted && selectedItemForEdit && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedItemForEdit(null)}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-md h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-[18px] font-semibold text-gray-900">Edit Inventory Item</h2>
              <button onClick={() => setSelectedItemForEdit(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Item Name</label>
                <input type="text" value={selectedItemForEdit.name} onChange={e => setSelectedItemForEdit({...selectedItemForEdit, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Quantity</label>
                  <input type="number" value={selectedItemForEdit.quantity} onChange={e => setSelectedItemForEdit({...selectedItemForEdit, quantity: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Unit</label>
                  <select value={selectedItemForEdit.unit} onChange={e => setSelectedItemForEdit({...selectedItemForEdit, unit: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand bg-white">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                    <option value="Units">Units</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Category</label>
                  <select value={selectedItemForEdit.category} onChange={e => setSelectedItemForEdit({...selectedItemForEdit, category: e.target.value as any})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand bg-white">
                    <option value="Raw Material">Raw Material</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Min Threshold</label>
                  <input type="number" value={selectedItemForEdit.minThreshold} onChange={e => setSelectedItemForEdit({...selectedItemForEdit, minThreshold: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand" />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setSelectedItemForEdit(null)} className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold text-[15px] py-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={handleEditSubmit} className="flex-1 bg-brand text-white font-semibold text-[15px] py-3 rounded-xl shadow-sm hover:shadow hover:bg-brand-hover transition-all cursor-pointer">
                Update Details
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* View Details Modal */}
      {mounted && selectedItemForView && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedItemForView(null)}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-md h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-[18px] font-semibold text-gray-900">Item Details</h2>
              <button onClick={() => setSelectedItemForView(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 relative shrink-0 bg-white shadow-sm">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedItemForView.name)}&background=F1F5F9&color=64748B&size=128`}
                    alt={selectedItemForView.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl tracking-tight leading-tight">{selectedItemForView.name}</h3>
                  <p className="text-[14px] font-medium text-gray-500 mt-0.5">{selectedItemForView.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="flex flex-col">
                  <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <div>
                    <span className={`inline-block text-[12px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                      selectedItemForView.status === "Critical" ? "bg-rose-100 text-rose-800" : 
                      selectedItemForView.status === "Low Stock" ? "bg-amber-100 text-amber-800" : 
                      "bg-emerald-100 text-emerald-800"
                    }`}>
                      {selectedItemForView.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Stock</p>
                  <p className="text-[16px] font-semibold text-gray-900">{selectedItemForView.quantity} <span className="text-gray-500 text-[14px] font-medium">{selectedItemForView.unit}</span></p>
                </div>
                
                <div className="flex flex-col">
                  <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Minimum Level</p>
                  <p className="text-[16px] font-semibold text-gray-900">{selectedItemForView.minThreshold} <span className="text-gray-500 text-[14px] font-medium">{selectedItemForView.unit}</span></p>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => handleDelete(selectedItemForView._id)} className="w-12 shrink-0 bg-white border border-rose-200 text-rose-600 font-semibold py-3 rounded-xl hover:bg-rose-50 transition-all cursor-pointer flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={() => { setSelectedItemForView(null); setSelectedItemForEdit(selectedItemForView); }} className="flex-1 bg-brand text-white font-semibold text-[15px] py-3 rounded-xl shadow-sm hover:shadow hover:bg-brand-hover transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
                <Pencil className="w-4 h-4" /> Edit & Restock
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
