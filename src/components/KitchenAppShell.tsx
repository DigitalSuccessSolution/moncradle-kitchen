"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { KitchenAuthProvider, useKitchenAuth } from "@/context/KitchenAuthContext";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import QuickActionModal from "@/components/QuickActionModal";
import PrintableLabelModal from "@/components/PrintableLabelModal";
import SplashScreen from "@/components/mobile/SplashScreen";
import { User, ArrowRight, ShieldCheck } from "lucide-react";
import { requestForToken, setupMessageListener } from "@/lib/firebase";

function ProfileIncompleteOverlay() {
  const router = useRouter();

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-md w-full text-center animate-fade-in-up">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-brand" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mb-3">
          Complete Your Profile
        </h1>
        <p className="text-[15px] text-slate-600 font-medium leading-relaxed mb-8 max-w-sm mx-auto">
          Before you can access the dashboard, please complete your kitchen partner profile with all the required details.
        </p>


        {/* CTA Button */}
        <button
          onClick={() => router.push("/profile")}
          className="w-full bg-brand hover:bg-brand-hover text-white font-medium text-[16px] py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          Go to Profile
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function KitchenAppInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading, isProfileComplete, isProfileChecking } = useKitchenAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";
  const isProfileRoute = pathname === "/profile";

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated && !isAuthRoute) {
      router.push("/login");
    }
    // Also handle redirect from root to dashboard for authenticated users
    if (isAuthenticated && pathname === "/") {
      router.push("/dashboard");
    }
  }, [isAuthLoading, isAuthenticated, isAuthRoute, pathname, router]);

  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined" && 'Notification' in window && Notification.permission !== 'denied') {
      requestForToken().then(fcmToken => {
        if (fcmToken) {
          const token = localStorage.getItem("moncradel_kitchen_token");
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          if (token) {
            fetch(`${apiUrl}/users/profile`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ fcmToken }),
            }).catch(console.error);
          }
        }
      });

      setupMessageListener((payload) => {
        const title = payload?.notification?.title || "New Notification";
        const options = {
          body: payload?.notification?.body || "",
          icon: '/icon-192x192.png',
        };

        // Show native browser notification even when app is open
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(title, options);

          notification.onclick = function () {
            window.focus();
            window.location.href = '/orders';
            this.close();
          };
        }
      });
    }
  }, [isAuthenticated]);

  // If on an auth route, just render the auth page (Login/Register)
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Show nothing while checking auth to prevent flash of wrong content
  if (isAuthLoading) {
    return <div className="h-[100dvh] bg-[#F8F9FA]" />;
  }

  // If not authenticated and not on auth route, we are redirecting or showing mobile modal
  if (!isAuthenticated) {
    return null;
  }

  // Determine if we should show the profile incomplete overlay
  const showProfileGate = !isProfileComplete && !isProfileChecking && !isProfileRoute;

  return (
    <>

      {/* AUTHENTICATED: Fixed Shell — Sidebar & Header never scroll */}
      <div className="h-[100dvh] flex bg-[#F8F9FA] text-slate-800 antialiased selection:bg-[#A5D8FF] font-sans overflow-hidden">
        {/* Desktop Navigation Sidebar — Fixed column, never scrolls */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar />
        </div>

        {/* Right Column: Header + Scrollable Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header — Fixed at top of content column */}
          <div className={`shrink-0 z-30 ${pathname === '/more' ? 'hidden md:block' : ''}`}>
            <Header />
          </div>

          {/* Main Content — ONLY this area scrolls */}
          {showProfileGate ? (
            <ProfileIncompleteOverlay />
          ) : (
            <main className={`flex-1 overflow-y-auto lg:pb-8 ${pathname === '/more' ? 'p-0 md:px-4 md:py-6 md:pb-24' : 'px-4 py-6 pb-24'}`}>
              <div className="w-full">
                {children}
              </div>
            </main>
          )}
        </div>

        {/* Mobile & Tablet Bottom Navigation Bar */}
        {pathname !== '/more' && !showProfileGate && (
          <div className="lg:hidden">
            <Navigation mode="mobile" />
          </div>
        )}

        <QuickActionModal />
        <PrintableLabelModal />
      </div>
    </>
  );
}

export default function KitchenAppShell({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState<boolean | null>(null);

  useEffect(() => {
    // If it's desktop view (width > 768px), don't show splash screen
    const isDesktop = window.innerWidth > 768;
    const splashSeen = sessionStorage.getItem("moncradel_kitchen_splash");
    
    if (isDesktop || splashSeen) {
      setShowSplash(false);
      // Ensure we don't show it later if they resize
      if (isDesktop && !splashSeen) {
        sessionStorage.setItem("moncradel_kitchen_splash", "true");
      }
    } else {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("moncradel_kitchen_splash", "true");
    setShowSplash(false);
  };

  // Prevent flicker before reading sessionStorage
  if (showSplash === null) {
    return <div className="min-h-screen w-full bg-[#F8F9FA]" />;
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <KitchenAuthProvider>
      <KitchenAppInner>{children}</KitchenAppInner>
    </KitchenAuthProvider>
  );
}
