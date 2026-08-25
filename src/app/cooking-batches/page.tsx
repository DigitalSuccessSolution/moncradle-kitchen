"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Play,
  CheckCircle2,
  X,
  PackageCheck,
  Trash2,
  UtensilsCrossed,
  Package,
  ChefHat
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

export default function ProductionPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [mealsList, setMealsList] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  
  const [isBatchDrawerOpen, setIsBatchDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for new batch form
  const [newBatchMeal, setNewBatchMeal] = useState("");
  const [newBatchQuantity, setNewBatchQuantity] = useState(50);

  const fetchBatches = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || ""; 
      
      const res = await fetch(`${apiUrl}/batches`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setBatches(data.data);
        setError(null);
        
        // Update selected batch if it's currently open
        if (selectedBatch) {
          const updated = data.data.find((b: any) => b._id === selectedBatch._id);
          if (updated) setSelectedBatch(updated);
        }
      } else {
        setError(data.message || "Failed to load batches");
      }
    } catch (err: any) {
      console.error("Error fetching batches:", err);
      setError("Failed to fetch batches from backend.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeals = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || ""; 
      
      const res = await fetch(`${apiUrl}/meals`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMealsList(data.data);
        if (data.data.length > 0 && !newBatchMeal) {
          setNewBatchMeal(data.data[0]._id);
        }
      }
    } catch (err: any) {
      console.error("Error fetching meals:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchBatches();
    fetchMeals();
    const interval = setInterval(fetchBatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenQuickAction = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateBatch = async () => {
    // Check if kitchen is open
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
          text: "Please turn your kitchen status to 'Currently Open' in the Profile page before creating a new batch.",
          icon: 'warning',
          confirmButtonColor: '#ea580c',
          confirmButtonText: 'Got it',
          customClass: { popup: 'rounded-2xl font-sans' }
        });
        return;
      }
    } catch(e) {
      console.error("Failed to check kitchen status", e);
    }

    if (!newBatchMeal || newBatchQuantity <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Please select a meal and provide a valid quantity.',
        confirmButtonColor: '#3085d6',
        customClass: { popup: 'rounded-2xl' }
      });
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || ""; 
      
      const res = await fetch(`${apiUrl}/batches`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          mealId: newBatchMeal,
          quantity: newBatchQuantity
        })
      });
      const data = await res.json();
      
      if (data.success) {
        await fetchBatches();
        setIsCreateModalOpen(false);
        Swal.fire({
          icon: 'success',
          title: 'Batch Created!',
          text: 'Orders have been linked to this batch.',
          confirmButtonColor: '#10b981',
          customClass: { popup: 'rounded-2xl', confirmButton: 'px-5 py-2.5 rounded-lg text-sm font-medium' }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: data.message || 'Could not create batch.',
          confirmButtonColor: '#3085d6',
          customClass: { popup: 'rounded-2xl' }
        });
      }
    } catch (err) {
      console.error("Error creating batch:", err);
    }
  };

  const updateBatchStatus = async (id: string, status: 'pending' | 'preparing' | 'ready' | 'completed') => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || ""; 
      
      const res = await fetch(`${apiUrl}/batches/${id}/status`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      
      if (data.success) {
        fetchBatches();
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Batch is now ${status}.`,
          confirmButtonColor: '#10b981',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-2xl' }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: data.message || 'Could not update batch status.',
          confirmButtonColor: '#3085d6',
          customClass: { popup: 'rounded-2xl' }
        });
      }
    } catch (err) {
      console.error("Error updating batch:", err);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    const result = await Swal.fire({
      title: 'Cancel Batch?',
      text: "This will revert all assigned orders back to pending.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#94a3b8', 
      confirmButtonText: 'Yes, Cancel Batch',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-5 py-2.5 rounded-lg text-sm font-medium',
        cancelButton: 'px-5 py-2.5 rounded-lg text-sm font-medium'
      }
    });

    if (result.isConfirmed) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("moncradel_kitchen_token") || ""; 
        
        const res = await fetch(`${apiUrl}/batches/${id}`, {
          method: 'DELETE',
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (data.success) {
          fetchBatches();
          setIsBatchDrawerOpen(false);
          Swal.fire({
            title: 'Cancelled!',
            text: 'The batch has been deleted and orders reverted.',
            icon: 'success',
            confirmButtonColor: '#10b981',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'px-5 py-2.5 rounded-lg text-sm font-medium'
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: data.message || 'Could not delete batch.',
            confirmButtonColor: '#3085d6',
            customClass: { popup: 'rounded-2xl' }
          });
        }
      } catch (err) {
        console.error("Error deleting batch:", err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16 max-w-2xl mx-auto lg:max-w-none lg:mx-0 font-sans">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-black tracking-tight mb-1">
            Kitchen Meal Production
          </h1>
          <p className="text-base text-black/80 font-medium hidden md:block">
            Manage active meal batches and their preparation stages.
          </p>
          {error && <p className="text-sm text-rose-500 font-medium mt-2">⚠ {error}</p>}
        </div>

        <button
          onClick={handleOpenQuickAction}
          className="flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-hover text-white font-medium text-xs px-4 py-2.5 rounded-2xl shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Batch</span>
        </button>
      </div>

      {/* 2. Active Batches Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-black flex items-center gap-2">
            <span>Active Cooking Queue</span>
          </h2>
          <span className="text-xs font-medium text-brand bg-[#A5D8FF]/30 px-3 py-1.5 rounded-full border border-[#A5D8FF]/60">
            {batches.length} BATCHES
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 rounded-2xl bg-white mt-4">
            <div className="w-16 h-16 bg-slate-50 border border-black/10 rounded-2xl flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-8 h-8 text-black/40" />
            </div>
            <h3 className="text-lg font-medium text-black mb-1">No Active Batches</h3>
            <p className="text-sm text-black/50 font-medium max-w-sm mb-6 leading-relaxed">
              There are currently no active cooking batches on the floor. Group pending orders into a new batch to get started.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-brand text-white font-medium px-6 py-3 rounded-xl shadow-sm hover:bg-brand-hover hover:shadow transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Create First Batch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((b) => {
              return (
                <div
                  key={b._id}
                  className="bg-white rounded-lg p-5 border border-black/10 hover:shadow-sm transition-all relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 pr-2">

                        <h2 
                          className="font-medium text-black text-lg leading-tight truncate"
                          title={b.mealId?.name}
                        >
                          {b.mealId?.name || 'Unknown Meal'}
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-2 text-[14px] pt-1">
                      <div className="flex flex-row items-center justify-between gap-2">
                        <span className="text-black font-medium flex items-center gap-1.5 shrink-0">
                          <Package className="w-4 h-4 text-sky-500" /> <span>Quantity</span>
                        </span>
                        <span className="font-medium text-black text-right truncate">
                          {b.quantity} Meals
                        </span>
                      </div>
                      <div className="flex flex-row items-center justify-between gap-2">
                        <span className="text-black font-medium flex items-center gap-1.5 shrink-0">
                          <ChefHat className="w-4 h-4 text-amber-500" /> <span>Cooked By</span>
                        </span>
                        <span className="font-medium text-black text-right truncate">
                          Kitchen Staff
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <span className={`inline-flex px-3 py-1 text-[12px] font-medium uppercase tracking-wider rounded-md border ${
                      b.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      b.status === 'preparing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      b.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      b.status === 'completed' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                      'bg-slate-100 text-black border-slate-300'
                    }`}>
                      {b.status}
                    </span>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedBatch(b); setIsBatchDrawerOpen(true); }}
                      className="px-4 py-1.5 bg-white border border-black/10 rounded-md text-black text-[13px] font-medium hover:bg-brand hover:text-white hover:border-brand transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Batch Details Drawer/Modal */}
      {mounted && isBatchDrawerOpen && selectedBatch && createPortal(
        <div className="batch-details-portal">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 z-[40] animate-fade-in"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setIsBatchDrawerOpen(false)}
          />
          
          <div className="fixed inset-0 z-[50] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
            <div className="relative bg-white w-full max-w-[100vw] sm:max-w-sm h-auto sm:max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border-0 sm:border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-2xl">
              
              <div className="flex items-center justify-between px-6 py-5 bg-white px-6 pt-6 pb-2">
                <div>
                  <h2 className="text-lg font-medium text-black">{selectedBatch.batchNumber}</h2>
                  <p className="text-sm text-black font-medium mt-0.5">{selectedBatch.mealId?.name || 'Unknown Meal'}</p>
                </div>
                <button 
                  onClick={() => setIsBatchDrawerOpen(false)}
                  className="p-1.5 text-black hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-100/80 p-4 rounded-xl">
                    <p className="text-[12px] font-medium text-black uppercase tracking-wider mb-1">Status</p>
                    <span className={`inline-block text-[15px] font-medium uppercase tracking-wider ${
                      selectedBatch.status === 'pending' ? 'text-amber-800' :
                      selectedBatch.status === 'preparing' ? 'text-blue-800' :
                      selectedBatch.status === 'ready' ? 'text-emerald-800' :
                      selectedBatch.status === 'completed' ? 'text-teal-800' :
                      'text-black'
                    }`}>
                      {selectedBatch.status}
                    </span>
                  </div>
                  <div className="bg-blue-100/80 p-4 rounded-xl">
                    <p className="text-[12px] font-medium text-black uppercase tracking-wider mb-1">Quantity</p>
                    <p className="font-medium text-black text-lg">{selectedBatch.quantity} Meals</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[12px] font-medium text-black uppercase tracking-wider">Assigned Chef</p>
                  <p className="font-medium text-black text-[15px]">Kitchen Staff</p>
                </div>
              </div>

              <div className="p-5 bg-white p-6 pt-4 flex flex-col gap-3">
                {selectedBatch.status === 'pending' && (
                  <div className="flex items-center gap-3 w-full">
                    <button onClick={() => handleDeleteBatch(selectedBatch._id)} className="w-14 shrink-0 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors py-3.5 rounded-xl flex items-center justify-center shadow-sm">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => updateBatchStatus(selectedBatch._id, 'preparing')} className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                      <Play className="w-4 h-4" /> Start Preparing
                    </button>
                  </div>
                )}
                
                {selectedBatch.status === 'preparing' && (
                  <button onClick={() => updateBatchStatus(selectedBatch._id, 'ready')} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-medium shadow-sm hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Mark as Ready
                  </button>
                )}

                {selectedBatch.status === 'ready' && (
                  <button onClick={() => updateBatchStatus(selectedBatch._id, 'completed')} className="w-full bg-brand text-white py-3.5 rounded-xl font-medium shadow-sm hover:bg-brand-hover transition-colors flex justify-center items-center gap-2">
                    <PackageCheck className="w-4 h-4" /> Complete Batch
                  </button>
                )}

                {selectedBatch.status === 'completed' && (
                  <div className="text-center py-2 text-emerald-600 font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Batch is fully completed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Batch Modal */}
      {mounted && isCreateModalOpen && createPortal(
        <div className="batch-details-portal">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 z-[40] animate-fade-in"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setIsCreateModalOpen(false)}
          />
          
          <div className="fixed inset-0 z-[50] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
            <div className="relative bg-white w-full max-w-[100vw] sm:max-w-sm h-auto sm:max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border-0 sm:border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-2xl">
              
              <div className="flex items-center justify-between px-6 py-5 bg-white px-6 pt-6 pb-2">
                <div>
                  <h2 className="text-lg font-medium text-black">Create New Batch</h2>
                  <p className="text-sm text-black font-medium mt-0.5">Group pending orders for cooking</p>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 text-black hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-black">Select Meal</label>
                  <select 
                    value={newBatchMeal} 
                    onChange={(e) => setNewBatchMeal(e.target.value)} 
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-[15px] text-black focus:outline-none focus:border-black bg-white"
                  >
                    {mealsList.map((meal: any) => (
                      <option key={meal._id} value={meal._id}>{meal.name}</option>
                    ))}
                    {mealsList.length === 0 && <option value="">No meals available</option>}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-black">Quantity (Number of Meals)</label>
                  <input 
                    type="number" 
                    value={newBatchQuantity} 
                    onChange={(e) => setNewBatchQuantity(Number(e.target.value))} 
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-[15px] text-black focus:outline-none focus:border-black bg-white" 
                  />
                  <p className="text-xs text-black font-medium pt-1">This will automatically assign up to {newBatchQuantity} pending orders to this batch.</p>
                </div>
              </div>

              <div className="p-5 bg-white p-6 pt-4 flex gap-3">
                <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-white border border-black/10 text-black font-medium text-[15px] py-3 rounded-xl hover:bg-black/5 transition-all cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleCreateBatch} className="flex-1 bg-brand text-white font-medium text-[15px] py-3 rounded-xl shadow-sm hover:shadow hover:bg-brand-hover transition-all cursor-pointer">
                  Create Batch
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
