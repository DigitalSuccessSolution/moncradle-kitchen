"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Users, UserCheck, ShieldCheck, Clock, Plus, Search, Filter, Phone, CheckCircle2, Eye, Edit2, X, Pencil } from "lucide-react";

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "onduty" | "morning" | "evening">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [staffMembers, setStaffMembers] = useState([
    {
      id: "STF-101",
      name: "Chef Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=200",
      role: "Head of Steam Prep",
      status: "On-Duty",
      shift: "Morning Shift (06:00 - 14:00)",
      station: "Steam Kettle Bay #1",
      phone: "+91 98765-XXXX",
      certifications: ["HACCP Level 3", "Food Safety SOP"],
      healthCheckup: "Valid till Dec 2026",
    },
    {
      id: "STF-102",
      name: "Chef Elena Sharma",
      avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=200",
      role: "Senior Nutritionist Chef",
      status: "On-Duty",
      shift: "Morning Shift (06:00 - 14:00)",
      station: "Blending & Portioning Bay",
      phone: "+91 98765-XXXX",
      certifications: ["Pediatric Nutritionist", "FDA Compliance"],
      healthCheckup: "Valid till Nov 2026",
    },
    {
      id: "STF-103",
      name: "Chef David Kim",
      avatar: "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&q=80&w=200",
      role: "Puree & Rapid Cooling Specialist",
      status: "On-Duty",
      shift: "Morning Shift (06:00 - 14:00)",
      station: "Blast Chiller Bay #2",
      phone: "+91 98765-XXXX",
      certifications: ["Cold Chain Specialist"],
      healthCheckup: "Valid till Jan 2027",
    },
    {
      id: "STF-104",
      name: "Chef Sarah Lin",
      avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=200",
      role: "Master Executive Chef",
      status: "On-Duty",
      shift: "Full Shift Lead",
      station: "Quality Control & Audit",
      phone: "+91 98765-XXXX",
      certifications: ["ISO 22000 Auditor", "FSSAI Lead"],
      healthCheckup: "Valid till Oct 2026",
    },
    {
      id: "STF-105",
      name: "Rohan Gupta",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      role: "Thermal Packaging Lead",
      status: "On Break",
      shift: "Evening Shift (14:00 - 22:00)",
      station: "Eco-Sealing Counter",
      phone: "+91 98765-XXXX",
      certifications: ["Thermal Seal Certified"],
      healthCheckup: "Valid till Sep 2026",
    },
  ]);

  const [newStaff, setNewStaff] = useState({
    name: "",
    phone: "",
    email: "",
    role: "Chef",
    shift: "Morning Shift",
    joiningDate: "",
    photo: null as any
  });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name) return;
    const added = {
      id: `STF-${100 + staffMembers.length + 1}`,
      name: newStaff.name,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      role: newStaff.role,
      status: "On-Duty",
      shift: newStaff.shift,
      station: "TBD",
      phone: newStaff.phone || "+91 00000-00000",
      certifications: [],
      healthCheckup: "Pending",
    };
    setStaffMembers([...staffMembers, added]);
    setNewStaff({
      name: "",
      phone: "",
      email: "",
      role: "Chef",
      shift: "Morning Shift",
      joiningDate: "",
      photo: null
    });
    setShowAddModal(false);
  };

  const handleEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForEdit) return;
    setStaffMembers(prev => prev.map(staff => 
      staff.id === selectedStaffForEdit.id ? selectedStaffForEdit : staff
    ));
    setSelectedStaffForEdit(null);
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
    <div className="space-y-6 animate-fade-in-up pb-16 max-w-2xl mx-auto lg:max-w-none lg:mx-0 font-sans">
      
      {/* 1. Header & Controls Row (Matched to Inventory) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight mb-1">
            Kitchen Staff Management
          </h1>
          <p className="text-sm text-slate-700 font-medium hidden md:block">
            Manage chefs, station assignments, shift rosters & safety certifications.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
            <input
              type="text"
              placeholder="Search by chef name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand/30"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-brand hover:bg-brand-hover text-white font-medium text-[13px] px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Staff</span>
          </button>
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

            {/* Current Station & Actions (Simplified) */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[12px] text-slate-700 font-medium">Assigned Station</span>
                <span className="text-[14px] font-medium text-slate-800 truncate">
                  {s.station}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedStaff(s)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand hover:border-brand hover:bg-slate-50 transition-colors cursor-pointer" title="View Details">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedStaffForEdit(s)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand hover:border-brand hover:bg-slate-50 transition-colors cursor-pointer" title="Edit Staff">
                  <Pencil className="w-4 h-4" />
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
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chef Anita Patel"
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
                    placeholder="+91 XXXXX-XXXXX"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="example@kitchen.com"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Role / Designation
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
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
                    value={newStaff.shift}
                    onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
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
                    className="w-full bg-brand text-white font-medium text-[15px] py-3 rounded-lg shadow-sm hover:shadow hover:bg-brand-hover transition-all duration-200 cursor-pointer"
                  >
                    Save Staff
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
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={selectedStaffForEdit.email || ""}
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Role / Designation
                  </label>
                  <select
                    value={selectedStaffForEdit.role}
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, role: e.target.value })}
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
                    Photo Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, photo: e.target.files?.[0] || null })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[12px] file:font-medium file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 block">
                    Current Status
                  </label>
                  <select
                    value={selectedStaffForEdit.status}
                    onChange={(e) => setSelectedStaffForEdit({ ...selectedStaffForEdit, status: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
                  >
                    <option value="On-Duty">On-Duty</option>
                    <option value="On Break">On Break</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-brand text-white font-medium text-[15px] py-3 rounded-lg shadow-sm hover:shadow hover:bg-brand-hover transition-all duration-200 cursor-pointer"
                  >
                    Update Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 4. View Details Modal (Inventory Style) */}
      {mounted && selectedStaff && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedStaff(null)}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-md h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border-0 sm:border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-[17px] font-medium text-slate-900">Staff Profile</h2>
              <button onClick={() => setSelectedStaff(null)} className="p-1.5 text-slate-700 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-100 relative shrink-0 bg-slate-50">
                  <Image
                    src={selectedStaff.avatar}
                    alt={selectedStaff.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 text-lg leading-tight">
                    {selectedStaff.name}
                  </h3>
                  <p className="text-[13px] font-medium text-slate-700 mt-0.5">
                    {selectedStaff.role}
                  </p>
                  <span className="text-[12px] text-slate-500 block pt-0.5 font-mono">
                    ID: {selectedStaff.id}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[12px] text-slate-700 font-medium">Current Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[12px] font-medium px-2 py-0.5 rounded uppercase tracking-wider ${
                      selectedStaff.status === "On-Duty"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {selectedStaff.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedStaff.station && (
                  <div className="space-y-1">
                    <p className="text-[12px] text-slate-700 font-medium">Station</p>
                    <p className="text-[14px] text-slate-900 font-medium">{selectedStaff.station}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[12px] text-slate-700 font-medium">Phone</p>
                  <p className="text-[14px] text-slate-900 font-medium">{selectedStaff.phone || "N/A"}</p>
                </div>
                {selectedStaff.email && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-[12px] text-slate-700 font-medium">Email</p>
                    <p className="text-[14px] text-slate-900 font-medium">{selectedStaff.email}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[12px] text-slate-700 font-medium">Shift</p>
                  <p className="text-[14px] text-slate-900 font-medium">{selectedStaff.shift}</p>
                </div>
                {selectedStaff.joiningDate && (
                  <div className="space-y-1">
                    <p className="text-[12px] text-slate-700 font-medium">Joining Date</p>
                    <p className="text-[14px] text-slate-900 font-medium">{selectedStaff.joiningDate}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[13px] text-slate-900 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand" /> Certifications & Health
                </p>
                <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-200/60">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStaff.certifications.map((c: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[12px]">
                    <span className="text-slate-700 font-medium">Health Checkup</span>
                    <span className="font-medium text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {selectedStaff.healthCheckup}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setSelectedStaff(null)}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-[14px] py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
