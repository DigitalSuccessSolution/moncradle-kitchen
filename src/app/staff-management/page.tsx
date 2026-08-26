"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Users, UserCheck, ShieldCheck, Clock, Plus, Search, Filter, Phone, Mail, CheckCircle2, Eye, EyeOff, Edit2, X, Pencil, Loader2, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import axios from "axios";

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "onduty" | "morning" | "evening">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('moncradel_kitchen_token');
      await axios.delete(`http://192.168.29.250:5000/api/staff/${staffToDelete._id || staffToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffMembers(staffMembers.filter((s: any) => s.id !== (staffToDelete._id || staffToDelete.id)));
      setStaffToDelete(null);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete staff member");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("moncradel_kitchen_token");
      if (!token) return;
      
      const response = await axios.get("http://192.168.29.250:5000/api/staff", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Map backend _id to id for existing frontend logic
        const formattedStaff = response.data.data.map((s: any) => ({
          ...s,
          id: s._id,
        }));
        setStaffMembers(formattedStaff);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStaff();
  }, []);

  const [staffMembers, setStaffMembers] = useState<any[]>([]);

  const [newStaff, setNewStaff] = useState({
    name: "",
    phone: "",
    email: "",
    role: "Chef",
    shift: "Morning Shift",
    joiningDate: "",
    station: "",
    status: "On-Duty",
    password: "",
    photo: null as any
  });

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.password || !newStaff.email || !newStaff.phone || !newStaff.joiningDate || !newStaff.role) {
      setErrorMsg("Please fill all required fields (Name, Phone, Email, Password, Role, Joining Date).");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const token = localStorage.getItem("moncradel_kitchen_token");
      
      const formData = new FormData();
      formData.append("name", newStaff.name);
      formData.append("phone", newStaff.phone);
      if (newStaff.email) formData.append("email", newStaff.email);
      formData.append("role", newStaff.role);
      formData.append("shift", newStaff.shift);
      formData.append("joiningDate", newStaff.joiningDate);
      if (newStaff.station) formData.append("station", newStaff.station);
      formData.append("status", newStaff.status);
      formData.append("password", newStaff.password);
      
      if (newStaff.photo) {
        formData.append("photo", newStaff.photo);
      }
      
      const response = await axios.post("http://192.168.29.250:5000/api/staff", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      if (response.data.success) {
        setNewStaff({
          name: "",
          phone: "",
          email: "",
          role: "Chef",
          shift: "Morning Shift",
          joiningDate: "",
          station: "",
          status: "On-Duty",
          password: "",
          photo: null
        });
        setShowAddModal(false);
        fetchStaff(); // Refresh list
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Error adding staff");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForEdit) return;
    
    if (!selectedStaffForEdit.name || !selectedStaffForEdit.email || !selectedStaffForEdit.phone || !selectedStaffForEdit.joiningDate || !selectedStaffForEdit.role) {
      setErrorMsg("Please fill all required fields (Name, Phone, Email, Role, Joining Date).");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const token = localStorage.getItem("moncradel_kitchen_token");
      
      const formData = new FormData();
      formData.append("name", selectedStaffForEdit.name);
      formData.append("phone", selectedStaffForEdit.phone);
      if (selectedStaffForEdit.email) formData.append("email", selectedStaffForEdit.email);
      formData.append("role", selectedStaffForEdit.role);
      formData.append("shift", selectedStaffForEdit.shift);
      formData.append("joiningDate", selectedStaffForEdit.joiningDate);
      if (selectedStaffForEdit.station) formData.append("station", selectedStaffForEdit.station);
      
      formData.append("status", selectedStaffForEdit.status);
      
      if (selectedStaffForEdit.password) {
        formData.append("password", selectedStaffForEdit.password);
      }
      
      if (selectedStaffForEdit.photo && selectedStaffForEdit.photo instanceof File) {
        formData.append("photo", selectedStaffForEdit.photo);
      }
      
      const response = await axios.put(`http://192.168.29.250:5000/api/staff/${selectedStaffForEdit.id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      if (response.data.success) {
        setSelectedStaffForEdit(null);
        fetchStaff();
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Error updating staff");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staffMembers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.station.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "onduty" && s.status === "On-Duty") ||
      (filter === "morning" && s.shift.includes("Morning")) ||
      (filter === "evening" && s.shift.includes("Evening"));
    return matchesSearch && matchesFilter;
  });

  return (
    <ProtectedRoute allowedRoles={['kitchen', 'admin', 'superadmin']}>
    <div className="space-y-6 animate-fade-in-up pb-16 max-w-2xl mx-auto lg:max-w-none lg:mx-0 font-sans">
      
      {/* 1. Header & Controls Row (Matched to Inventory) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-medium text-slate-900 tracking-tight mb-1 whitespace-nowrap">
            Staff Management
          </h1>
          <p className="text-sm text-slate-700 font-medium hidden md:block">
            Manage chefs, station assignments, shift rosters & safety certifications.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-col gap-3 w-full sm:w-auto sm:items-end">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
            <input
              type="text"
              placeholder="Search by chef name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
               href="/attendance"
               className="flex-1 sm:flex-none bg-white text-brand border border-brand font-medium text-[13px] px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm hover:bg-brand/5"
            >
              <Clock className="w-4 h-4 stroke-[2.5]" />
              <span className="whitespace-nowrap">Attendance</span>
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none bg-brand hover:bg-brand-hover text-white font-medium text-[13px] px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="whitespace-nowrap">Add Staff</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "All Staff" },
          { id: "onduty", label: "On-Duty Only" },
          { id: "morning", label: "Morning Shift" },
          { id: "evening", label: "Evening Shift" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filter === tab.id
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Simplified Mobile Cards (Matched to Inventory) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-lg p-5 border border-slate-200/80 space-y-3 relative overflow-hidden transition-all"
          >
            {/* Header & Status Tag */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 relative shrink-0 bg-slate-50">
                  <Image
                    src={s.avatar}
                    alt={s.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-slate-800 text-base leading-tight truncate">
                    {s.name}
                  </h3>
                  <p className="text-[12px] font-medium text-slate-700 mt-0.5 truncate">
                    {s.role}
                  </p>
                </div>
              </div>

              {/* Status Ribbon Tag matching Inventory */}
              <span
                className={`shrink-0 whitespace-nowrap text-[11px] font-medium px-2 py-0.5 rounded uppercase tracking-wider ${
                  s.status === "On-Duty"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {s.status}
              </span>
            </div>

            {/* Details & Actions */}
            <div className="pt-2 flex items-end justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-medium">{s.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-medium">{s.shift}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedStaff(s)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand hover:border-brand hover:bg-slate-50 transition-colors cursor-pointer" title="View Details">
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const dateStr = s.joiningDate ? new Date(s.joiningDate).toISOString().split('T')[0] : '';
                    setSelectedStaffForEdit({
                      ...s,
                      role: s.designation || 'Chef',
                      joiningDate: dateStr
                    });
                  }} 
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand hover:border-brand hover:bg-slate-50 transition-colors cursor-pointer" 
                  title="Edit Staff"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setStaffToDelete(s)} 
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-colors cursor-pointer" 
                  title="Delete Staff"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Add Staff Modal (Inventory Style) */}
      {mounted && showAddModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-md h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border-0 sm:border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-[17px] font-medium text-slate-900">Add Staff Member</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-700 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {errorMsg && <div className="mb-4 text-red-500 text-sm font-medium">{errorMsg}</div>}
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chef Anita Patel"
                    minLength={3}
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                    value={newStaff.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewStaff({ ...newStaff, phone: val });
                    }}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="example@kitchen.com"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Staff Login Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAddPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      minLength={6}
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      required
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-10 text-[14px] focus:outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
                    >
                      {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Role / Designation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  >
                    <option value="Head Chef">Head Chef</option>
                    <option value="Chef">Chef</option>
                    <option value="Packer">Packer</option>
                    <option value="Quality Checker">Quality Checker</option>
                    <option value="Dispatch Coordinator">Dispatch Coordinator</option>
                    <option value="Cleaner">Cleaner</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Shift Assignment <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newStaff.shift}
                    onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  >
                    <option value="Morning Shift">Morning Shift</option>
                    <option value="Afternoon Shift">Afternoon Shift</option>
                    <option value="Night Shift">Night Shift</option>
                    <option value="Custom Time">Custom Time</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newStaff.joiningDate}
                    onChange={(e) => setNewStaff({ ...newStaff, joiningDate: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Photo Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewStaff({ ...newStaff, photo: e.target.files?.[0] || null })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[12px] file:font-medium file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand text-white font-medium text-[15px] py-3 rounded-lg shadow-sm hover:shadow hover:bg-brand-hover transition-all duration-200 cursor-pointer disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Staff"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Staff Modal (Inventory Style) */}
      {mounted && selectedStaffForEdit && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedStaffForEdit(null)}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-md h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border-0 sm:border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-[17px] font-medium text-slate-900">Edit Staff Member</h2>
              <button onClick={() => setSelectedStaffForEdit(null)} className="p-1.5 text-slate-700 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleEditStaff} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={selectedStaffForEdit.name}
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, name: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={selectedStaffForEdit.phone || ""}
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, phone: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedStaffForEdit.email || ""}
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, email: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Reset Password (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={selectedStaffForEdit.password || ""}
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, password: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Role / Designation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedStaffForEdit.role}
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, role: e.target.value })}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  >
                    <option value="Head Chef">Head Chef</option>
                    <option value="Chef">Chef</option>
                    <option value="Packer">Packer</option>
                    <option value="Quality Checker">Quality Checker</option>
                    <option value="Dispatch Coordinator">Dispatch Coordinator</option>
                    <option value="Cleaner">Cleaner</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Shift Assignment
                  </label>
                  <select
                    value={selectedStaffForEdit.shift}
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, shift: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  >
                    <option value="Morning Shift">Morning Shift</option>
                    <option value="Afternoon Shift">Afternoon Shift</option>
                    <option value="Night Shift">Night Shift</option>
                    <option value="Custom Time">Custom Time</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={selectedStaffForEdit.joiningDate || ""}
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, joiningDate: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Update Password (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      placeholder="Leave blank to keep unchanged"
                      minLength={6}
                      value={selectedStaffForEdit.password || ""}
                      onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, password: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-10 text-[14px] focus:outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
                    >
                      {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>


                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Photo Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, photo: e.target.files?.[0] || null })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[12px] file:font-medium file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand text-white font-medium text-[15px] py-3 rounded-lg shadow-sm hover:shadow hover:bg-brand-hover transition-all duration-200 cursor-pointer disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Staff"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 5. View Details Modal (Staff ID Card Style) */}
      {mounted && selectedStaff && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedStaff(null)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-t-xl sm:rounded-xl overflow-hidden animate-slide-up shadow-2xl pointer-events-auto">
            {/* Header / Cover Area */}
            <div className="h-24 bg-gradient-to-r from-brand to-brand/80 relative">
              <button 
                onClick={() => setSelectedStaff(null)} 
                className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors cursor-pointer backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Avatar Profile */}
            <div className="px-6 relative pb-6">
              <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 absolute -top-10 left-6 overflow-hidden shadow-sm">
                <Image
                  src={selectedStaff.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                  alt={selectedStaff.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="pt-12">
                <h3 className="text-[20px] font-semibold text-slate-900">{selectedStaff.name}</h3>
                <p className="text-[14px] text-brand font-medium mt-0.5">{selectedStaff.designation || "Kitchen Staff"}</p>
                
                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-[14px]">{selectedStaff.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-[14px]">{selectedStaff.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-[14px]">{selectedStaff.shift}</span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">Status</span>
                    <span className="text-[14px] font-medium text-slate-900 mt-0.5">{selectedStaff.status || "On-Duty"}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">Joined</span>
                    <span className="text-[14px] font-medium text-slate-900 mt-0.5">
                      {selectedStaff.joiningDate ? new Date(selectedStaff.joiningDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 6. Delete Confirmation Modal */}
      {mounted && staffToDelete && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-center p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setStaffToDelete(null)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-xl overflow-hidden animate-zoom-in shadow-2xl pointer-events-auto p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Staff Member?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to remove <strong>{staffToDelete.name}</strong> from your kitchen? They will no longer be able to log in. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteStaff}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
    </ProtectedRoute>
  );
}
