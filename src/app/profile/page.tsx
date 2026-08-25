"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  User, CheckCircle2, MapPin, Building2, Camera, Store, CreditCard, Clock, LogOut, Loader2, Save, Mail, Phone, Edit2, X
} from "lucide-react";
import axios from "axios";
import { useKitchenAuth } from "@/context/KitchenAuthContext";

export default function ProfilePage() {
  const { logout, recheckProfile } = useKitchenAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile States
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [kitchenName, setKitchenName] = useState("");
  const [fssaiLicenseNumber, setFssaiLicenseNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [preparationCapacityPerDay, setPreparationCapacityPerDay] = useState("");
  const [cuisineTypes, setCuisineTypes] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");

  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfscCode, setBankIfscCode] = useState("");
  const [bankName, setBankName] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || "";
      const res = await axios.get(`${apiUrl}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = res.data.user;
      const profileData = res.data.profile;

      if (userData) {
        setOwnerName(userData.name || "");
        setEmail(userData.email || "");
        setPhone(userData.phone || "");
        setAddress(userData.address || "");
        if (userData.avatar) setAvatar(userData.avatar);
      }

      if (profileData) {
        setKitchenName(profileData.kitchenName || "");
        setFssaiLicenseNumber(profileData.fssaiLicenseNumber || "");
        setGstNumber(profileData.gstNumber || "");
        setPreparationCapacityPerDay(profileData.preparationCapacityPerDay?.toString() || "");
        setIsOpen(profileData.isOpen || false);
        
        if (profileData.cuisineTypes && Array.isArray(profileData.cuisineTypes)) {
          setCuisineTypes(profileData.cuisineTypes.join(", "));
        }
        
        if (profileData.operatingHours) {
          setOpenTime(profileData.operatingHours.openTime || "");
          setCloseTime(profileData.operatingHours.closeTime || "");
        }
        
        if (profileData.bankDetails) {
          setBankAccountName(profileData.bankDetails.accountName || "");
          setBankName(profileData.bankDetails.bankName || "");
          setBankAccountNumber(profileData.bankDetails.accountNumber || "");
          setBankIfscCode(profileData.bankDetails.ifscCode || "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show immediately
      setAvatar(URL.createObjectURL(file));
      
      // Upload immediately for better UX
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("moncradel_kitchen_token") || "";
        const formData = new FormData();
        formData.append("avatar", file);
        
        await axios.put(`${apiUrl}/users/profile`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } catch (err) {
        console.error("Failed to upload avatar", err);
        alert("Failed to save profile photo.");
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || "";

      const cuisineArray = cuisineTypes.split(",").map(c => c.trim()).filter(Boolean);
      
      const payload = {
        name: ownerName,
        email: email,
        phone: phone,
        address: address,
        kitchenName,
        fssaiLicenseNumber,
        gstNumber,
        preparationCapacityPerDay: preparationCapacityPerDay ? Number(preparationCapacityPerDay) : 0,
        cuisineTypes: cuisineArray,
        isOpen,
        operatingHours: { openTime, closeTime },
        bankDetails: {
          accountName: bankAccountName,
          accountNumber: bankAccountNumber,
          ifscCode: bankIfscCode,
          bankName: bankName
        }
      };

      await axios.put(`${apiUrl}/users/profile`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      setIsEditModalOpen(false); // Close modal on success
      // Re-check profile completion to unlock other pages
      await recheckProfile();
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditModalOpen(false);
    fetchProfile(); // Reset any unsaved typed changes
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-black placeholder-black/30 focus:outline-none focus:border-brand transition-colors";
  const labelClass = "text-[13px] font-semibold text-black uppercase tracking-wider mb-1.5 block";

  // Reusable component for displaying read-only data
  const DetailRow = ({ label, value, fallback = "Not provided" }: { label: string, value: string, fallback?: string }) => (
    <div>
      <p className="text-[13px] font-semibold text-black uppercase tracking-wider mb-1.5 block">{label}</p>
      <p className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-black">{value || <span className="text-black/40 italic">{fallback}</span>}</p>
    </div>
  );

  const handleToggleStatus = async (newStatus: boolean) => {
    setIsOpen(newStatus);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("moncradel_kitchen_token") || "";
      await axios.put(`${apiUrl}/users/profile`, { isOpen: newStatus }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      console.error("Failed to toggle status", err);
      alert("Failed to update kitchen status.");
      setIsOpen(!newStatus);
    }
  };

  return (
    <div className="animate-fade-in-up pb-16 font-sans max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-black tracking-tight mb-1">
            Kitchen Partner Profile
          </h1>
          <p className="text-base text-black/80 font-medium hidden md:block">
            Manage your kitchen details, compliance, and banking information.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-white border border-slate-200 px-4 py-2 rounded-xl gap-3">
            <div className="flex flex-col text-right leading-tight">
              <span className="text-[14px] font-bold text-slate-800">Kitchen Status</span>
              <span className={`text-[12px] font-semibold ${isOpen ? 'text-emerald-600' : 'text-rose-500'}`}>
                {isOpen ? "Currently Open" : "Currently Closed"}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-1">
              <input type="checkbox" className="sr-only peer" checked={isOpen} onChange={(e) => handleToggleStatus(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 border border-slate-300 peer-checked:border-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center gap-3 animate-fadeIn mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Profile Saved Successfully!</p>
            <p className="text-[13px] text-emerald-700 font-medium">
              Your kitchen partner details have been updated in the system.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Avatar Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-brand/10 to-transparent"></div>
              
              <div className="relative mt-4 mb-5">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100 relative">
                  {avatar ? (
                    <Image src={avatar} alt="Profile" width={128} height={128} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                
                {/* Camera Badge */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 bg-white border-2 border-slate-100 shadow-md rounded-full flex items-center justify-center text-slate-600 hover:text-brand hover:border-brand/30 transition-all z-10 cursor-pointer"
                  title="Change Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>

              <h3 className="text-2xl font-bold text-black tracking-tight mb-3">{ownerName || "Owner Name"}</h3>
              
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="flex items-center gap-2 text-[14px] text-black/70 justify-center">
                  <Mail className="w-4 h-4 text-brand shrink-0" />
                  <span className="font-medium truncate">{email || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-[14px] text-black/70 justify-center">
                  <Phone className="w-4 h-4 text-brand shrink-0" />
                  <span className="font-medium truncate">{phone || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details Display */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 relative">
              
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-black">Kitchen Details</h2>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-black text-[14px] font-semibold rounded-lg border border-slate-200 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-brand" />
                  Edit Details
                </button>
              </div>

              <div className="space-y-10">
                {/* Basic Info */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Basic Information</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <DetailRow label="Kitchen Name" value={kitchenName} />
                    <DetailRow label="Full Address" value={address} />
                  </div>
                </div>

                {/* Operations & Compliance */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Operations & Compliance</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <DetailRow label="FSSAI License" value={fssaiLicenseNumber} />
                    <DetailRow label="GST Number" value={gstNumber} />
                    <DetailRow label="Daily Capacity" value={preparationCapacityPerDay ? `${preparationCapacityPerDay} Meals` : ""} />
                    <DetailRow label="Cuisine Types" value={cuisineTypes} />
                    <DetailRow label="Operating Hours" value={openTime && closeTime ? `${openTime} to ${closeTime}` : ""} />
                    <div>
                      <p className="text-[13px] font-semibold text-black/60 uppercase tracking-wider mb-1">Status</p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold ${isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {isOpen ? "Currently Open" : "Closed"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Bank Details</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <DetailRow label="Account Name" value={bankAccountName} />
                    <DetailRow label="Bank Name" value={bankName} />
                    <DetailRow label="Account Number" value={bankAccountNumber} />
                    <DetailRow label="IFSC Code" value={bankIfscCode} />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Edit Profile Modal */}
      {mounted && isEditModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={cancelEdit}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-3xl h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-[18px] font-semibold text-gray-900">Edit Profile Details</h2>
              <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <form id="editProfileForm" onSubmit={handleSaveProfile} className="space-y-10">
                
                {/* Section 1 */}
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                    <Building2 className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Basic Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Kitchen Name</label>
                      <input type="text" value={kitchenName} onChange={(e) => setKitchenName(e.target.value)} className={inputClass} placeholder="e.g. Moncradel Central Hub" required />
                    </div>
                    <div>
                      <label className={labelClass}>Owner Name</label>
                      <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} placeholder="John Doe" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Full Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-black/40" />
                        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={`${inputClass} pl-9 resize-none`} placeholder="Complete facility address..." required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                    <Store className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Operations & Compliance</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>FSSAI License Number</label>
                      <input type="text" value={fssaiLicenseNumber} onChange={(e) => setFssaiLicenseNumber(e.target.value)} className={inputClass} placeholder="e.g. FSSAI-1234567890" required />
                    </div>
                    <div>
                      <label className={labelClass}>GST Number</label>
                      <input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className={inputClass} placeholder="22AAAAA0000A1Z5" required />
                    </div>
                    <div>
                      <label className={labelClass}>Daily Capacity (Meals)</label>
                      <input type="number" value={preparationCapacityPerDay} onChange={(e) => setPreparationCapacityPerDay(e.target.value)} className={inputClass} placeholder="e.g. 500" required />
                    </div>
                    <div>
                      <label className={labelClass}>Cuisine Types (Comma Separated)</label>
                      <input type="text" value={cuisineTypes} onChange={(e) => setCuisineTypes(e.target.value)} className={inputClass} placeholder="e.g. Infant Meals, Toddler Puree" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Operating Hours</label>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                          <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className={`${inputClass} pl-9`} required />
                        </div>
                        <span className="text-sm font-medium text-black/60">to</span>
                        <div className="relative flex-1">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                          <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className={`${inputClass} pl-9`} required />
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2 mt-2 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div>
                          <h4 className="text-[14px] font-bold text-black">Kitchen Status</h4>
                          <p className="text-[12px] text-black/60 font-medium mt-0.5">Turn this off if your kitchen is temporarily closed.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="ml-3 text-[14px] font-bold text-black">{isOpen ? "Currently Open" : "Closed"}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                    <CreditCard className="w-5 h-5 text-black/70" />
                    <h2 className="text-base font-medium text-black">Bank Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Account Name</label>
                      <input type="text" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className={inputClass} placeholder="As per bank records" />
                    </div>
                    <div>
                      <label className={labelClass}>Bank Name</label>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} placeholder="e.g. HDFC Bank" />
                    </div>
                    <div>
                      <label className={labelClass}>Account Number</label>
                      <input type="text" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className={inputClass} placeholder="0000 0000 0000" />
                    </div>
                    <div>
                      <label className={labelClass}>IFSC Code</label>
                      <input type="text" value={bankIfscCode} onChange={(e) => setBankIfscCode(e.target.value)} className={`${inputClass} uppercase`} placeholder="HDFC0001234" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 flex gap-3 bg-white">
              <button type="button" onClick={cancelEdit} className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold text-[15px] py-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                Cancel
              </button>
              <button type="submit" form="editProfileForm" disabled={isSaving} className="flex-1 bg-brand text-white font-semibold text-[15px] py-3 rounded-xl shadow-sm hover:shadow hover:bg-brand-hover transition-all cursor-pointer flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
