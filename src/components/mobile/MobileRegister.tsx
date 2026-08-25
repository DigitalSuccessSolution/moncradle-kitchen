"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, Mail, Phone, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

interface MobileRegisterProps {
  onSwitchToLogin: () => void;
}

export default function MobileRegister({ onSwitchToLogin }: MobileRegisterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2>(1);
  
  const [regEmail, setRegEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regOtp, setRegOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: { [key: string]: string } = {};
    if (!regName) errors.name = "Full Name is required";
    if (!regPhone) {
      errors.phone = "Phone number is required";
    } else if (regPhone.length !== 10 || !/^\d{10}$/.test(regPhone)) {
      errors.phone = "Enter a valid 10-digit number";
    }
    
    if (!regEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      errors.email = "Invalid email format";
    }

    if (!regPassword) {
      errors.password = "Password is required";
    } else if (regPassword.length < 6) {
      errors.password = "Must be at least 6 characters";
    }

    if (!regConfirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
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

  const handleResendOtp = async () => {
    if (!regEmail) return;
    
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
      
      if (!data.success) {
        setErrorMsg(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error connecting to server.");
    }
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOtp) return;
    
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
        onSwitchToLogin();
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error connecting to server.");
    }
    setIsLoading(false);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#FBF9F6] relative px-4 py-6 overflow-hidden font-sans">
      <div className="w-full flex flex-col h-full max-w-sm mx-auto">
        
        {/* Spacer above logo */}
        <div className="flex-[0.5] min-h-[0.5rem]" />

        {/* Top Section: Logo */}
        <div className="flex-shrink-0 w-full flex items-center justify-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Image 
            src="/logo.png" 
            alt="Moncradel Logo" 
            width={200} 
            height={50} 
            className="h-14 w-auto object-contain"
            priority
          />
        </div>

        {/* Spacer between logo and titles */}
        <div className="flex-[0.8] min-h-[1.5rem]" />

        {/* Title Section */}
        <div className="flex-shrink-0 w-full text-center mb-8 space-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-[26px] font-semibold text-[#163C24] tracking-tight">
            {regStep === 1 ? "Create Your Account" : "Verify Email"}
          </h2>
          <p className="text-[13px] font-medium text-[#6C8A60]">
            {regStep === 1 
              ? "Join Moncradel Kitchen and start managing orders" 
              : `OTP sent to ${regEmail}`}
          </p>
        </div>

        {/* Form Section */}
        <div className="flex-shrink-0 w-full h-full overflow-y-auto no-scrollbar pb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium p-2 rounded-xl text-center mb-4 mx-1">
              {errorMsg}
            </div>
          )}

          {regStep === 1 && (
            <form onSubmit={handleSendOtp} className="flex flex-col space-y-3">
              {/* Full Name & Phone */}
              <div className="flex flex-col space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#163C24] ml-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" strokeWidth={2} />
                    </div>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        setRegName(val);
                      }}
                      className={`w-full pl-10 pr-3 py-3 bg-white border rounded-[14px] text-slate-900 text-[14px] font-medium focus:outline-none focus:ring-0 transition-all ${
                        fieldErrors.name ? "border-red-400 focus:border-red-500" : "border-[#D5E3D0] focus:border-[#6C8A60]"
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {fieldErrors.name && <p className="text-red-500 text-[11px] font-medium ml-1 mt-1">{fieldErrors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#163C24] ml-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" strokeWidth={2} />
                    </div>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setRegPhone(val);
                      }}
                      className={`w-full pl-10 pr-3 py-3 bg-white border rounded-[14px] text-slate-900 text-[14px] font-medium focus:outline-none focus:ring-0 transition-all ${
                        fieldErrors.phone ? "border-red-400 focus:border-red-500" : "border-[#D5E3D0] focus:border-[#6C8A60]"
                      }`}
                      placeholder="9876543210"
                    />
                  </div>
                  {fieldErrors.phone && <p className="text-red-500 text-[11px] font-medium ml-1 mt-1">{fieldErrors.phone}</p>}
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#163C24] ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s/g, '');
                      setRegEmail(val);
                    }}
                    className={`w-full pl-11 pr-4 py-3 bg-white border rounded-[14px] text-slate-900 text-[15px] font-medium focus:outline-none focus:ring-0 transition-all ${
                      fieldErrors.email ? "border-red-400 focus:border-red-500" : "border-[#D5E3D0] focus:border-[#6C8A60]"
                    }`}
                    placeholder="kitchen@moncradel.com"
                  />
                </div>
                {fieldErrors.email && <p className="text-red-500 text-[11px] font-medium ml-1 mt-1">{fieldErrors.email}</p>}
              </div>

              {/* Password & Confirm */}
              <div className="flex flex-col space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#163C24] ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" strokeWidth={2} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={`w-full pl-10 pr-9 py-3 bg-white border rounded-[14px] text-slate-900 text-[14px] font-medium focus:outline-none focus:ring-0 transition-all ${
                        fieldErrors.password ? "border-red-400 focus:border-red-500" : "border-[#D5E3D0] focus:border-[#6C8A60]"
                      }`}
                      placeholder="Password"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-red-500 text-[11px] font-medium ml-1 mt-1">{fieldErrors.password}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#163C24] ml-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" strokeWidth={2} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-9 py-3 bg-white border rounded-[14px] text-slate-900 text-[14px] font-medium focus:outline-none focus:ring-0 transition-all ${
                        fieldErrors.confirmPassword ? "border-red-400 focus:border-red-500" : "border-[#D5E3D0] focus:border-[#6C8A60]"
                      }`}
                      placeholder="Confirm"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-red-500 text-[11px] font-medium ml-1 mt-1">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>

              <div className="pt-2" />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[54px] bg-[#133F23] text-white rounded-full font-medium text-[15px] hover:bg-[#0D2D18] transition-all flex items-center justify-center relative disabled:opacity-70 active:scale-[0.98] shadow-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Create Account</span>
                    <div className="absolute right-2 top-1.5 bottom-1.5 w-10 border border-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white stroke-[2]" />
                    </div>
                  </>
                )}
              </button>
            </form>
          )}

          {regStep === 2 && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6 pt-2 flex flex-col justify-center">
              <div className="space-y-3 text-center">
                <label className="text-[13px] font-medium text-[#163C24] block mb-3">Enter 4-Digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={regOtp}
                  onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full max-w-[180px] mx-auto block px-4 py-3 bg-white border border-[#D5E3D0] rounded-[14px] text-slate-900 text-2xl font-semibold tracking-[0.5em] text-center focus:outline-none focus:ring-1 focus:ring-[#133F23] focus:border-[#133F23]"
                  placeholder="0000"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || regOtp.length !== 4}
                className="w-full h-[54px] bg-[#133F23] text-white rounded-full font-medium text-[15px] hover:bg-[#0D2D18] transition-all flex items-center justify-center relative disabled:opacity-70 active:scale-[0.98] shadow-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Verify & Register</span>
                    <div className="absolute right-2 top-1.5 bottom-1.5 w-10 border border-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white stroke-[2]" />
                    </div>
                  </>
                )}
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-[13px] font-medium text-[#6C8A60] hover:text-[#163C24] transition-colors"
                >
                  Didn't receive the code? <span className="font-semibold text-[#163C24]">Resend OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Link */}
          <div className="mt-4 pb-4 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={onSwitchToLogin}
              className="text-[#425044] font-medium text-[13px] flex items-center justify-center mx-auto hover:text-[#163C24] transition-colors gap-1.5"
            >
              Already have an account? <span className="font-semibold text-[#163C24]">Sign In</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
