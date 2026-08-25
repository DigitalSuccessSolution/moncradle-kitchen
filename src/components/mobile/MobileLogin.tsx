"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface MobileLoginProps {
  onSwitchToRegister: () => void;
}

export default function MobileLogin({ onSwitchToRegister }: MobileLoginProps) {
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: { [key: string]: string } = {};
    if (!loginEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      errors.email = "Invalid email format";
    }
    
    if (!loginPassword) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      
      if (data.success && data.token) {
        if (!['kitchen', 'admin', 'superadmin'].includes(data.role)) {
          setErrorMsg("Access Denied: You do not have Kitchen Partner access.");
          setIsLoading(false);
          return;
        }

        localStorage.setItem("moncradel_kitchen_token", data.token);
        localStorage.setItem("moncradel_kitchen_user", JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        }));
        
        // This is needed for the current KitchenAuthContext implementation
        localStorage.setItem("moncradel_kitchen_auth", "true");
        document.cookie = `moncradel_kitchen_token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
        
        window.dispatchEvent(new Event("moncradel-login"));
        window.location.href = "/dashboard";
      } else {
        setErrorMsg(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error connecting to server. Check your connection.");
    }
    
    setIsLoading(false);
  };

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
          <h2 className="text-[26px] font-semibold text-[#163C24] tracking-tight">Welcome Back</h2>
          <p className="text-[13px] font-medium text-[#6C8A60]">
            Sign in to access your kitchen dashboard
          </p>
        </div>

        {/* Form Section */}
        <div className="flex-shrink-0 w-full h-full overflow-y-auto no-scrollbar pb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <form onSubmit={handleLoginSubmit} className="flex flex-col space-y-3">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium p-2 rounded-xl text-center mb-1 mx-1">
                {errorMsg}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#163C24] ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" strokeWidth={2} />
                </div>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\s/g, '');
                    setLoginEmail(val);
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-[14px] text-slate-900 text-[14px] font-medium focus:outline-none focus:ring-0 transition-all ${
                    fieldErrors.email ? "border-red-400 focus:border-red-500" : "border-[#D5E3D0] focus:border-[#6C8A60]"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-[11px] font-medium ml-1 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#163C24] ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 bg-white border rounded-[14px] text-slate-900 text-[14px] font-medium focus:outline-none focus:ring-0 transition-all ${
                    fieldErrors.password ? "border-red-400 focus:border-red-500" : "border-[#D5E3D0] focus:border-[#6C8A60]"
                  }`}
                  placeholder="Enter your password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-[11px] font-medium ml-1 mt-1">{fieldErrors.password}</p>}
              
              <div className="flex justify-end pt-1">
                <button 
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-[12px] font-medium text-[#163C24] hover:underline focus:outline-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[54px] bg-[#133F23] text-white rounded-full font-medium text-[15px] hover:bg-[#0D2D18] transition-all flex items-center justify-center relative disabled:opacity-70 active:scale-[0.98] shadow-sm"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Sign In</span>
                  <div className="absolute right-2 top-1.5 bottom-1.5 w-10 border border-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white stroke-[2]" />
                  </div>
                </>
              )}
            </button>
          </form>
          {/* Footer Link */}
          <div className="mt-6 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={onSwitchToRegister}
              className="text-[#425044] font-medium text-[13px] flex items-center justify-center mx-auto hover:text-[#163C24] transition-colors gap-1.5"
            >
              New to Moncradel? <span className="font-semibold text-[#163C24]">Create Account</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
