"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useKitchenAuth } from "@/context/KitchenAuthContext";
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, ChefHat, ShieldCheck, TrendingUp, Store } from "lucide-react";
import MobileAuthFlow from "@/components/mobile/MobileAuthFlow";

export default function LoginPage() {
  const { isAuthenticated } = useKitchenAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{email?: boolean; password?: boolean}>({});
  
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: {email?: boolean; password?: boolean} = {};
    if (!loginEmail) errors.email = true;
    if (!loginPassword) errors.password = true;
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
        // Set cookie for middleware
        document.cookie = `moncradel_kitchen_token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
        
        window.location.href = "/dashboard";
      } else {
        setErrorMsg(data.message || "Invalid credentials.");
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
      <MobileAuthFlow initialMode="login" />
    </div>

    {/* Desktop Login */}
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
        <div className="flex-1 flex flex-col justify-center px-12 lg:px-24">
          <div className="max-w-md animate-slide-in-left" style={{ opacity: 0 }}>
            {/* Logo */}
            <div className="mb-8">
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
            <h1 className="text-4xl lg:text-5xl font-serif text-slate-800 mb-3 tracking-tight">
              Welcome <span className="text-brand">Back</span>
            </h1>
            <p className="text-slate-600 font-medium text-[14px] leading-relaxed mb-8">
              Sign in to your cloud kitchen dashboard and manage your orders, menus and customers — all in one place.
            </p>

            {/* Features */}
            <div className="space-y-6 mt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#114227] flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-black text-[16px]">Manage Easily</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#114227] flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-black text-[16px]">Secure & Reliable</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#114227] flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-black text-[16px]">Grow Your Business</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
          
          <div className="w-full max-w-[460px] bg-white rounded-[24px] p-8 lg:p-10 shadow-2xl relative z-10 animate-slide-in-from-right transition-all duration-500" style={{ opacity: 0 }}>
            
            <div className="mb-6">
              <h2 className="text-[28px] font-serif text-slate-900 mb-1.5">Glad to see you again!</h2>
              <p className="text-[15px] font-medium text-slate-500">
                Please sign in to continue to your dashboard
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium p-3 rounded-xl">
                  {errorMsg}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[14px] font-medium text-slate-800 ml-1">Email Address</label>
                <div className={`relative flex items-center bg-white border ${fieldErrors.email ? 'border-red-400' : 'border-slate-200 focus-within:border-brand'} rounded-xl transition-all`}>
                  <div className="pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: false });
                    }}
                    onKeyDown={handleEmailKeyDown}
                    className="w-full pl-3 pr-4 py-3 bg-transparent text-slate-900 text-[15px] font-medium focus:outline-none"
                    placeholder="e.g., owner@kitchen.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-medium text-slate-800 ml-1">Password</label>
                <div className={`relative flex items-center bg-white border ${fieldErrors.password ? 'border-red-400' : 'border-slate-200 focus-within:border-brand'} rounded-xl transition-all`}>
                  <div className="pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    ref={passwordRef}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: false });
                    }}
                    className="w-full pl-3 pr-10 py-3 bg-transparent text-slate-900 text-[15px] font-medium focus:outline-none"
                    placeholder="Enter your secure password"
                  />
                  <div 
                    className="absolute right-0 pr-3.5 flex items-center cursor-pointer h-full"
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

              <div className="flex items-center justify-end pt-0.5">
                <button type="button" onClick={() => router.push("/forgot-password")} className="text-[13px] font-medium text-brand hover:underline focus:outline-none">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#114227] text-white py-3.5 rounded-xl font-medium text-[16px] shadow-md shadow-brand/10 hover:bg-[#0c311c] transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-70 group"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-[14px] text-slate-600 font-medium">
                Don't have an account?{" "}
                <Link 
                  href="/register"
                  className="text-brand font-medium hover:underline ml-1 focus:outline-none"
                >
                  Create one <ArrowRight className="inline w-3 h-3 mb-0.5 ml-0.5" />
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
