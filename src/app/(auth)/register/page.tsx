"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useKitchenAuth } from "@/context/KitchenAuthContext";
import { Loader2, Mail, Lock, User, Phone, ArrowRight, ChevronLeft, Eye, EyeOff, ChefHat, ShieldCheck, TrendingUp } from "lucide-react";
import MobileAuthFlow from "@/components/mobile/MobileAuthFlow";
export default function RegisterPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2>(1);
  
  const [regEmail, setRegEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regOtp, setRegOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{name?: boolean; phone?: boolean; email?: boolean; password?: boolean; confirmPassword?: boolean; otp?: boolean}>({});

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: {name?: boolean; phone?: boolean; email?: boolean; password?: boolean; confirmPassword?: boolean} = {};
    if (!regName) errors.name = true;
    if (!regPhone) errors.phone = true;
    if (!regEmail) errors.email = true;
    if (!regPassword) errors.password = true;
    if (!regConfirmPassword) errors.confirmPassword = true;
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;
    
    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (regPhone.length !== 10) {
      setErrorMsg("Phone number must be exactly 10 digits.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/send-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail }),
      });
      const data = await res.json();
      
      if (data.success) {
        setRegStep(2);
      } else {
        setErrorMsg(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error connecting to server.");
    }
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOtp) {
      setFieldErrors((prev) => ({ ...prev, otp: true }));
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          name: regName,
          phone: regPhone,
          password: regPassword,
          otp: regOtp,
          role: "kitchen"
        }),
      });
      const data = await res.json();
      
      if (data.success && data.token) {
        // Flow: User registers -> goes to login page -> then logs in to access dashboard
        window.location.href = "/login";
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error connecting to server.");
    }
    setIsLoading(false);
  };

  return (
    <>
    {/* Mobile Fallback: Splash Screen */}
    <div className="flex md:hidden min-h-screen w-full bg-[#F8F9FA]">
      <MobileAuthFlow initialMode="register" />
    </div>

    {/* Desktop Register */}
    <div className="hidden md:flex h-screen w-full relative font-sans overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/loginregisterbg.png"
          alt="Kitchen Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
      </div>
      
      <div className="relative z-10 w-full flex flex-row h-full">
        
        {/* Left Side Content */}
        <div className="flex-1 flex flex-col justify-center px-10 lg:px-20">
          <div className="max-w-md animate-slide-in-left" style={{ opacity: 0 }}>
            {/* Logo */}
            <div className="mb-6">
              <Image 
                src="/logo.png" 
                alt="Moncradel Logo" 
                width={200} 
                height={50} 
                className="h-12 w-auto object-contain"
                priority
              />
            </div>

            {/* Heading */}
            <h1 className="text-4xl lg:text-5xl font-serif text-slate-800 mb-3 tracking-tight leading-tight">
              Create Your <br/><span className="text-brand">Partner Account</span>
            </h1>
            <p className="text-slate-800 font-medium text-[13px] leading-relaxed mb-6">
              Join Moncradel and take your cloud kitchen business to new heights. Manage orders, menus, and customers all in one place.
            </p>

            {/* Features */}
            <div className="space-y-6 mt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#114227] flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-black text-[16px]">Easy Onboarding</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#114227] flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-black text-[16px]">Smart Management</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#114227] flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-black text-[16px]">Secure & Reliable</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10">
          
          <div className="w-full max-w-[500px] bg-white rounded-[24px] p-8 shadow-2xl relative z-10 animate-slide-in-from-right transition-all duration-500" style={{ opacity: 0 }}>
            
            <div className="mb-6">
              <h2 className="text-[28px] font-serif text-slate-900 mb-1.5">
                {regStep === 1 ? "Create Your Account" : "Verify Email"}
              </h2>
              <p className="text-[15px] font-medium text-slate-500">
                {regStep === 1 
                  ? "Fill in your details to create your partner account" 
                  : `Verification code sent to ${regEmail}`}
              </p>
            </div>

            {/* STEP 1 */}
            {regStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {errorMsg && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] font-medium p-2.5 rounded-xl">
                    {errorMsg}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[14px] font-medium text-slate-800 ml-1">Full Name</label>
                    <div className={`relative flex items-center bg-white border ${fieldErrors.name ? 'border-red-400' : 'border-slate-200 focus-within:border-brand'} rounded-xl transition-all`}>
                      <div className="pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => {
                          setRegName(e.target.value);
                          if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: false });
                        }}
                        className="w-full pl-3 pr-3 py-2.5 bg-transparent text-slate-900 text-[15px] font-medium focus:outline-none"
                        placeholder="e.g., John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[14px] font-medium text-slate-800 ml-1">Phone Number</label>
                    <div className={`relative flex items-center bg-white border ${fieldErrors.phone ? 'border-red-400' : 'border-slate-200 focus-within:border-brand'} rounded-xl transition-all`}>
                      <div className="pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                          if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: false });
                        }}
                        className="w-full pl-3 pr-3 py-2.5 bg-transparent text-slate-900 text-[15px] font-medium focus:outline-none"
                        placeholder="e.g., 9876543210"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-slate-800 ml-1">Email Address</label>
                  <div className={`relative flex items-center bg-white border ${fieldErrors.email ? 'border-red-400' : 'border-slate-200 focus-within:border-brand'} rounded-xl transition-all`}>
                    <div className="pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: false });
                      }}
                      className="w-full pl-3 pr-3 py-2.5 bg-transparent text-slate-900 text-[15px] font-medium focus:outline-none"
                      placeholder="e.g., owner@kitchen.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[14px] font-medium text-slate-800 ml-1">Password</label>
                    <div className={`relative flex items-center bg-white border ${fieldErrors.password ? 'border-red-400' : 'border-slate-200 focus-within:border-brand'} rounded-xl transition-all`}>
                      <div className="pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: false });
                        }}
                        className="w-full pl-3 pr-9 py-2.5 bg-transparent text-slate-900 text-[15px] font-medium focus:outline-none"
                        placeholder="At least 8 characters"
                      />
                      <div 
                        className="absolute right-0 pr-3 flex items-center cursor-pointer h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[14px] font-medium text-slate-800 ml-1">Confirm Password</label>
                    <div className={`relative flex items-center bg-white border ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-slate-200 focus-within:border-brand'} rounded-xl transition-all`}>
                      <div className="pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={regConfirmPassword}
                        onChange={(e) => {
                          setRegConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: false });
                        }}
                        className="w-full pl-3 pr-9 py-2.5 bg-transparent text-slate-900 text-[15px] font-medium focus:outline-none"
                        placeholder="Re-enter your password"
                      />
                      <div 
                        className="absolute right-0 pr-3 flex items-center cursor-pointer h-full"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>



                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#114227] text-white py-3 rounded-xl text-[16px] font-medium shadow-md shadow-brand/10 hover:bg-[#0c311c] transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-70 group"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2 */}
            {regStep === 2 && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {errorMsg && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] font-medium p-2.5 rounded-xl">
                    {errorMsg}
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    type="button" 
                    onClick={() => setRegStep(1)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[12px] font-medium text-slate-700">Back</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-slate-800 ml-1">Email OTP</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={regOtp}
                    onChange={(e) => {
                      setRegOtp(e.target.value.replace(/\D/g, ''));
                      if (fieldErrors.otp) setFieldErrors({ ...fieldErrors, otp: false });
                    }}
                    className={`w-full px-4 py-3 bg-white border ${fieldErrors.otp ? 'border-red-400' : 'border-slate-200 focus:border-brand'} rounded-xl text-slate-900 text-[15px] font-medium tracking-widest text-center focus:outline-none transition-all`}
                    placeholder="0000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#114227] text-white py-3 rounded-xl text-[16px] font-medium shadow-md shadow-brand/10 hover:bg-[#0c311c] transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-70 group"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Complete"}
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-[14px] text-slate-600 font-medium">
                Already have an account?{" "}
                <Link 
                  href="/login"
                  className="text-brand font-medium hover:underline ml-1 focus:outline-none"
                >
                  Login <ArrowRight className="inline w-3 h-3 mb-0.5 ml-0.5" />
                </Link>
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
