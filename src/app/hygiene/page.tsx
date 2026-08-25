"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Camera, Calendar, CheckSquare, Plus, Trash2, X, Loader2, Pencil } from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";
import axios from "axios";

export interface HygieneTask {
  _id: string;
  taskName: string;
  status: "pending" | "completed";
  date: string;
  photoUrl: string;
}

export default function HygienePage() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [tasks, setTasks] = useState<HygieneTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTaskName, setEditTaskName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  const fetchTasks = async (dateStr: string) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
      const res = await axios.get(`${apiUrl}/hygiene?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.data || []);
    } catch (err) {
      console.error("Error fetching hygiene tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchTasks(selectedDate);
  }, [selectedDate]);

  const toggleTaskStatus = async (id: string) => {
    const taskToUpdate = tasks.find(t => t._id === id);
    if (!taskToUpdate) return;
    
    const newStatus = taskToUpdate.status === "completed" ? "pending" : "completed";
    
    // Optimistic UI update
    setTasks(tasks.map(t => t._id === id ? { ...t, status: newStatus } : t));
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
      await axios.put(`${apiUrl}/hygiene/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Error updating status:", err);
      // Revert on error
      setTasks(tasks.map(t => t._id === id ? { ...t, status: taskToUpdate.status } : t));
    }
  };

  const deleteTask = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#059669', // bg-emerald-600
      cancelButtonColor: '#f43f5e',  // bg-rose-500
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-2xl',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
          await axios.delete(`${apiUrl}/hygiene/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setTasks(tasks.filter(t => t._id !== id));
          
          Swal.fire({
            title: 'Deleted!',
            text: 'Your task has been deleted.',
            icon: 'success',
            confirmButtonColor: '#059669',
            customClass: {
              popup: 'rounded-2xl',
            }
          });
        } catch (err) {
          console.error("Error deleting task:", err);
          Swal.fire('Error', 'Failed to delete task.', 'error');
        }
      }
    });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
      const res = await axios.post(`${apiUrl}/hygiene`, 
        { taskName: newTaskName.trim(), date: selectedDate, status: "pending" }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data && res.data.data) {
        setTasks([...tasks, res.data.data]);
      } else {
        fetchTasks(selectedDate);
      }
      
      setNewTaskName("");
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error adding task:", err);
      alert("Failed to add task.");
    }
  };

  const openEditModal = (task: HygieneTask) => {
    setEditTaskId(task._id);
    setEditTaskName(task.taskName);
    setIsEditModalOpen(true);
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTaskName.trim() || !editTaskId) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
      const res = await axios.put(`${apiUrl}/hygiene/${editTaskId}`, 
        { taskName: editTaskName.trim() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data && res.data.data) {
        setTasks(tasks.map(t => t._id === editTaskId ? res.data.data : t));
      } else {
        fetchTasks(selectedDate);
      }
      
      setIsEditModalOpen(false);
      setEditTaskId(null);
    } catch (err) {
      console.error("Error editing task:", err);
      alert("Failed to edit task.");
    }
  };

  const openFilePicker = (taskId: string) => {
    setActiveUploadId(taskId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadId) {
      const formData = new FormData();
      formData.append("photo", file);
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
        const res = await axios.put(`${apiUrl}/hygiene/${activeUploadId}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        
        if (res.data && res.data.data) {
          setTasks(tasks.map(t => t._id === activeUploadId ? res.data.data : t));
        } else {
          fetchTasks(selectedDate);
        }
      } catch (err) {
        console.error("Error uploading photo:", err);
        alert("Failed to upload photo.");
      }
    }
    
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setActiveUploadId(null);
  };

  const removePhoto = async (taskId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || localStorage.getItem("token") || "";
      
      // Update backend to remove photoUrl
      await axios.put(`${apiUrl}/hygiene/${taskId}`, { photoUrl: "" }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setTasks(tasks.map(t => t._id === taskId ? { ...t, photoUrl: "" } : t));
    } catch (err) {
      console.error("Error removing photo:", err);
      alert("Failed to remove photo.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16 max-w-2xl mx-auto lg:max-w-none lg:mx-0 font-sans">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[18px] sm:text-3xl font-medium text-black tracking-tight mb-1 whitespace-nowrap truncate">
            Kitchen Hygiene & Safety Logs
          </h1>
          <p className="text-base text-black/80 font-medium hidden md:block">
            Record daily safety inspections and attach photo proofs.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 w-full sm:w-auto shrink-0">
          <Calendar className="w-4 h-4 text-black/40" />
          <span className="font-medium text-[14px] text-black shrink-0">Log Date:</span>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-[14px] text-black font-medium focus:outline-none ml-1 cursor-pointer w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Hidden File Input for photos */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />

      {/* 2. Items List */}
      <div className="space-y-4 mt-2">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-[15px] sm:text-base font-medium text-black leading-tight">
              Daily Safety Checklist
            </h2>
            <span className="w-fit text-[11px] sm:text-[12px] font-medium text-brand bg-brand/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-brand/20">
              {tasks.filter(t => t.status === 'completed').length} / {tasks.length} Completed
            </span>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-brand hover:bg-brand-hover text-white font-medium text-[12px] sm:text-[13px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-[14px] font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 flex flex-col items-center justify-center text-center">
            <CheckSquare className="w-10 h-10 text-slate-300 mb-3" />
            <h3 className="text-[16px] font-medium text-slate-700 mb-1">No tasks found</h3>
            <p className="text-[13px] text-slate-500 mb-4 max-w-sm">
              There are no hygiene tasks recorded for {selectedDate}. Click the button below to add one.
            </p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-[13px] px-5 py-2.5 rounded-lg transition-colors"
            >
              Add First Task
            </button>
          </div>
        ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col"
            >
              {/* Photo Area - Takes up upper half */}
              {task.photoUrl ? (
                <div className="w-full h-44 relative bg-slate-100 group/photo overflow-hidden">
                  <Image 
                    src={task.photoUrl} 
                    alt={task.taskName} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover/photo:scale-105"
                  />
                </div>
              ) : (
                <button 
                  onClick={() => openFilePicker(task._id)}
                  className="w-full h-44 bg-slate-50 hover:bg-slate-100/80 border-b border-slate-100 flex flex-col items-center justify-center gap-3 transition-colors group/upload cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover/upload:text-brand group-hover/upload:border-brand/30 transition-all shadow-sm transform group-hover/upload:-translate-y-1">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-[13px] font-medium text-slate-500 group-hover/upload:text-brand transition-colors">Tap to Attach Photo</span>
                </button>
              )}
              
              {/* Content Area - Lower half */}
              <div className="p-5 flex items-start gap-3.5 flex-1 bg-white">
                <div
                  onClick={() => toggleTaskStatus(task._id)}
                  className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center border-2 shrink-0 transition-colors cursor-pointer ${
                    task.status === "completed"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 bg-slate-50 hover:border-slate-400"
                  }`}
                >
                  {task.status === "completed" && <CheckSquare className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col h-full">
                   <h3 
                     onClick={() => toggleTaskStatus(task._id)}
                     className="text-[15px] font-medium leading-snug cursor-pointer select-none text-slate-800 transition-colors"
                   >
                     {task.taskName}
                   </h3>
                   
                   <div className="flex items-center justify-between mt-auto pt-4">
                     <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md uppercase tracking-wide ${
                       task.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                     }`}>
                       {task.status === "completed" ? "Completed" : "Pending"}
                     </span>
                     
                     <div className="flex items-center gap-1">
                       {task.status !== "completed" && (
                         <>
                           <button 
                             onClick={() => deleteTask(task._id)}
                             className="text-slate-800 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                             title="Delete Task"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => openEditModal(task)}
                             className="text-slate-800 hover:text-brand p-2 hover:bg-brand/10 rounded-lg transition-colors"
                             title="Edit Task"
                           >
                             <Pencil className="w-4 h-4" />
                           </button>
                         </>
                       )}
                     </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Add Task Modal */}
      {mounted && isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => { setIsAddModalOpen(false); setNewTaskName(""); }}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-[400px] h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="text-[18px] font-semibold text-gray-900">Add Checklist Task</h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewTaskName("");
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-50/50 flex-1 overflow-y-auto">
              <form onSubmit={handleAddTask} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">
                    Task Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    list="hygiene-tasks-list"
                    placeholder="e.g. Sanitize prep tables"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand shadow-sm"
                  />
                  <datalist id="hygiene-tasks-list">
                    <option value="Clean Floor" />
                    <option value="Wash Tables" />
                    <option value="Take out Trash" />
                    <option value="Wash Utensils" />
                    <option value="Clean Fridge" />
                  </datalist>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Clean Floor", "Wash Tables", "Take out Trash", "Wash Utensils"].map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setNewTaskName(suggestion)}
                        className="text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-brand hover:bg-brand-hover text-white font-bold text-[14px] py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Task Modal */}
      {mounted && isEditModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => { setIsEditModalOpen(false); setEditTaskId(null); }}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-[400px] h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="text-[18px] font-semibold text-gray-900">Edit Checklist Task</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditTaskId(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-50/50 flex-1 overflow-y-auto">
              <form onSubmit={handleEditTask} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">
                    Task Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    list="hygiene-tasks-list"
                    placeholder="e.g. Sanitize prep tables"
                    value={editTaskName}
                    onChange={(e) => setEditTaskName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-brand shadow-sm"
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Clean Floor", "Wash Tables", "Take out Trash", "Wash Utensils"].map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setEditTaskName(suggestion)}
                        className="text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-1.5 pt-2 border-t border-gray-100 mt-4">
                  <label className="text-[13px] font-semibold text-gray-700">Photo</label>
                  <div className="flex items-center gap-4 mt-2">
                    {tasks.find(t => t._id === editTaskId)?.photoUrl ? (
                      <>
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 relative shrink-0">
                          <Image src={tasks.find(t => t._id === editTaskId)!.photoUrl} alt="Task Photo" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <button 
                            type="button" 
                            onClick={() => openFilePicker(editTaskId!)} 
                            className="text-[13px] text-brand hover:bg-brand/10 px-3 py-1.5 rounded-lg font-medium transition-colors border border-brand/30"
                          >
                            Change Photo
                          </button>
                        </div>
                      </>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => openFilePicker(editTaskId!)} 
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl text-[13px] font-medium text-slate-700 transition-colors flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4 text-slate-400" /> Upload Photo
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-brand hover:bg-brand-hover text-white font-bold text-[14px] py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
