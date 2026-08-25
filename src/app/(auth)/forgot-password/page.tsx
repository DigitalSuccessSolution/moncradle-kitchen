"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import MobileForgotPassword from "@/components/mobile/MobileForgotPassword";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{email?: boolean; otp?: boolean; newPassword?: boolean}>({});

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setFieldErrors({ email: true });
      return;
    }

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: {otp?: boolean; newPassword?: boolean} = {};
    if (!otp) errors.otp = true;
    if (!newPassword) errors.newPassword = true;
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
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Password reset successful! Redirecting...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setErrorMsg(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setErrorMsg("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile View */}
      <div className="flex md:hidden min-h-screen w-full bg-[#F8F9FA]">
        <MobileForgotPassword />
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex min-h-[100dvh] w-full items-center justify-center bg-[#f8f9fa] font-sans relative overflow-hidden p-4 sm:p-6">
        {/* Abstract Background Shapes for some aesthetic */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
        
        {/* Form Panel / Modal */}
        <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-slate-100 relative z-10 animate-fade-in-up">
          
          {/* Header Branding */}
          <div className="flex items-center justify-center mb-10">
            <Image 
              src="/logo.png" 
              alt="Moncradel Kitchen Logo" 
              width={240} 
              height={60} 
              className="h-12 w-auto object-contain"
              priority
            />
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {step === 1 ? "Reset your password" : "Set new password"}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              {step === 1 
                ? "Enter your email to receive an OTP." 
                : "Enter the OTP sent to your email to set a new password."}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium p-3 rounded-xl mb-5">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-100 text-green-600 text-[13px] font-medium p-3 rounded-xl mb-5">
              {successMsg}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700 ml-1">Email Address</label>
                <div className={`relative flex items-center bg-slate-50 border ${fieldErrors.email ? 'border-red-400' : 'border-slate-200 focus-within:border-brand'} rounded-xl transition-all`}>
                  <div className="pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: false });
                    }}
                    className="w-full pl-3 pr-4 py-3.5 bg-transparent text-slate-900 text-[15px] font-medium focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="e.g., john@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand text-white py-3.5 rounded-xl font-medium shadow-md shadow-brand/20 hover:bg-brand/90 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700 ml-1">4-Digit OTP</label>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/[^0-9]/g, ""));
                    if (fieldErrors.otp) setFieldErrors({ ...fieldErrors, otp: false });
                  }}
                  className={`w-full px-4 py-3.5 bg-slate-50 border ${fieldErrors.otp ? 'border-red-400' : 'border-slate-200 focus:border-brand'} rounded-xl text-slate-900 text-[20px] font-bold tracking-[0.5em] text-center focus:outline-none transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-[15px] placeholder:font-normal`}
                  placeholder="0000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700 ml-1">New Password</label>
                <div className={`relative flex items-center bg-slate-50 border ${fieldErrors.newPassword ? 'border-red-400' : 'border-slate-200 focus-within:border-brand'} rounded-xl transition-all`}>
                  <div className="pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: false });
                    }}
                    className="w-full pl-3 pr-11 py-3.5 bg-transparent text-slate-900 text-[15px] font-medium focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="Create a strong password"
                  />
                  <div 
                    className="absolute right-0 pr-4 flex items-center cursor-pointer h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    ) : (
                      <Eye className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 4 || !newPassword}
                className="w-full bg-brand text-white py-3.5 rounded-xl font-medium shadow-md shadow-brand/20 hover:bg-brand/90 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Set New Password"}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[14px] text-slate-600 font-medium">
              Remembered your password?{" "}
              <Link 
                href="/login"
                className="text-brand font-bold hover:underline ml-1 focus:outline-none"
              >
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
