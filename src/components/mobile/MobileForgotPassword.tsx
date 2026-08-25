"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function MobileForgotPassword() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: { [key: string]: string } = {};
    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || "OTP sent successfully!");
        setStep(2);
      } else {
        setErrorMsg(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setErrorMsg("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 4) {
      setFieldErrors({ otp: "Please enter the 4-digit OTP" });
      return;
    }
    
    setFieldErrors({});
    setErrorMsg("");
    setSuccessMsg("");
    
    // Move to step 3. The actual verification happens during reset-password API call.
    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: { [key: string]: string } = {};
    if (!newPassword) {
      errors.newPassword = "Password is required";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Must be at least 6 characters";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Backend expects 'password' and 'confirmPassword' along with 'otp' and 'email'
        body: JSON.stringify({ 
          email, 
          otp, 
          password: newPassword, 
          confirmPassword 
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Password reset successful! Redirecting...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        // If OTP was invalid, push user back to step 2
        if (data.message && data.message.toLowerCase().includes("otp")) {
          setStep(2);
          setErrorMsg(data.message || "Invalid or expired OTP.");
        } else {
          setErrorMsg(data.message || "Failed to reset password.");
        }
      }
    } catch (err) {
      setErrorMsg("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else router.push("/login");
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#FBF9F6] relative px-4 py-6 overflow-hidden font-sans">
      
      {/* Back Button (Absolute Top Left) */}
      <button 
        onClick={goBack}
        className="absolute top-6 left-4 w-10 h-10 rounded-full bg-white border border-[#D5E3D0] flex items-center justify-center text-[#163C24] hover:bg-[#EBF0E7] transition-colors z-20 shadow-sm opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-full flex flex-col h-full max-w-sm mx-auto relative z-10">
        
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
            {step === 1 ? "Reset Password" : step === 2 ? "Verify OTP" : "Set New Password"}
          </h2>
          <p className="text-[13px] font-medium text-[#6C8A60]">
            {step === 1 
              ? "Enter your email to receive an OTP" 
              : step === 2 
              ? "Enter the OTP sent to your email"
              : "Create a strong new password"}
          </p>
        </div>

        {/* Form Section */}
        <div className="flex-shrink-0 w-full h-full overflow-y-auto no-scrollbar pb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium p-2 rounded-xl text-center mb-4 mx-1">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-[12px] font-medium p-2 rounded-xl text-center mb-4 mx-1">
              {successMsg}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="flex flex-col space-y-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#163C24] ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s/g, '');
                      setEmail(val);
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-[14px] text-slate-900 text-[14px] font-medium focus:outline-none focus:ring-0 transition-all ${
                      fieldErrors.email ? "border-red-400 focus:border-red-500" : "border-[#D5E3D0] focus:border-[#6C8A60]"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {fieldErrors.email && <p className="text-red-500 text-[11px] font-medium ml-1 mt-1">{fieldErrors.email}</p>}
              </div>

              <div className="pt-2" />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[54px] bg-[#133F23] text-white rounded-full font-medium text-[15px] hover:bg-[#0D2D18] transition-all flex items-center justify-center relative disabled:opacity-70 active:scale-[0.98] shadow-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Send OTP</span>
                    <div className="absolute right-2 top-1.5 bottom-1.5 w-10 border border-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white stroke-[2]" />
                    </div>
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2 flex flex-col justify-center">
              <div className="space-y-1.5 text-center mb-2">
                <label className="text-[13px] font-medium text-[#163C24] block mb-3">4-Digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/[^0-9]/g, ""));
                  }}
                  className={`w-full max-w-[180px] mx-auto block px-4 py-3 bg-white border ${fieldErrors.otp ? 'border-red-400 focus:border-red-500' : 'border-[#D5E3D0] focus:border-[#133F23]'} rounded-[14px] text-slate-900 text-2xl font-semibold tracking-[0.5em] text-center focus:outline-none focus:ring-1 transition-colors`}
                  placeholder="0000"
                />
                {fieldErrors.otp && <p className="text-red-500 text-[11px] font-medium mt-2">{fieldErrors.otp}</p>}
              </div>

              <div className="pt-2" />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[54px] bg-[#133F23] text-white rounded-full font-medium text-[15px] hover:bg-[#0D2D18] transition-all flex items-center justify-center relative disabled:opacity-70 active:scale-[0.98] shadow-sm"
              >
                <span>Verify OTP</span>
                <div className="absolute right-2 top-1.5 bottom-1.5 w-10 border border-white/20 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white stroke-[2]" />
                </div>
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4 pt-2 flex flex-col justify-center">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#163C24] ml-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" strokeWidth={2} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full pl-10 pr-9 py-3 bg-white border rounded-[14px] text-slate-900 text-[14px] font-medium focus:outline-none focus:ring-0 transition-all ${
                      fieldErrors.newPassword ? "border-red-400 focus:border-red-500" : "border-[#D5E3D0] focus:border-[#6C8A60]"
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
                  </button>
                </div>
                {fieldErrors.newPassword && <p className="text-red-500 text-[11px] font-medium ml-1 mt-1">{fieldErrors.newPassword}</p>}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-9 py-3 bg-white border rounded-[14px] text-slate-900 text-[14px] font-medium focus:outline-none focus:ring-0 transition-all ${
                      fieldErrors.confirmPassword ? "border-red-400 focus:border-red-500" : "border-[#D5E3D0] focus:border-[#6C8A60]"
                    }`}
                    placeholder="Confirm new password"
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

              <div className="pt-2" />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[54px] bg-[#133F23] text-white rounded-full font-medium text-[15px] hover:bg-[#0D2D18] transition-all flex items-center justify-center relative disabled:opacity-70 active:scale-[0.98] shadow-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Set New Password</span>
                    <div className="absolute right-2 top-1.5 bottom-1.5 w-10 border border-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white stroke-[2]" />
                    </div>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Link */}
          <div className="mt-6 pb-4 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={() => router.push("/login")}
              className="text-[#425044] font-medium text-[13px] flex items-center justify-center mx-auto hover:text-[#163C24] transition-colors gap-1.5"
            >
              Remembered your password? <span className="font-semibold text-[#163C24]">Sign In</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
