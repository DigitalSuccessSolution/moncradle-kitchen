"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

interface KitchenAuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isProfileComplete: boolean;
  isProfileChecking: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showApkModal: boolean;
  setShowApkModal: (show: boolean) => void;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  loginWithOtp: (phone: string, otp: string) => boolean;
  logout: () => void;
  recheckProfile: () => Promise<void>;
}

const KitchenAuthContext = createContext<KitchenAuthContextType | undefined>(undefined);

export function KitchenAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(true); // Default true to avoid flash
  const [isProfileChecking, setIsProfileChecking] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showApkModal, setShowApkModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const checkProfileCompletion = useCallback(async () => {
    const token = localStorage.getItem("moncradel_kitchen_token");
    if (!token) {
      setIsProfileComplete(false);
      return;
    }

    setIsProfileChecking(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.get(`${apiUrl}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = res.data.user;
      const profileData = res.data.profile;

      // Check all required fields (excluding bank details)
      const requiredUserFields = [
        userData?.name,
        userData?.email,
        userData?.phone,
        userData?.address,
      ];

      const requiredProfileFields = [
        profileData?.kitchenName,
        profileData?.fssaiLicenseNumber,
        profileData?.gstNumber,
        profileData?.preparationCapacityPerDay,
        profileData?.operatingHours?.openTime,
        profileData?.operatingHours?.closeTime,
      ];

      const hasCuisineTypes = profileData?.cuisineTypes && Array.isArray(profileData.cuisineTypes) && profileData.cuisineTypes.length > 0;

      const allUserFieldsFilled = requiredUserFields.every(f => f && String(f).trim() !== "");
      const allProfileFieldsFilled = requiredProfileFields.every(f => f !== undefined && f !== null && String(f).trim() !== "");

      const complete = allUserFieldsFilled && allProfileFieldsFilled && hasCuisineTypes;
      setIsProfileComplete(complete);
    } catch (err) {
      console.error("Failed to check profile completion", err);
      // On error, don't block — assume complete
      setIsProfileComplete(true);
    } finally {
      setIsProfileChecking(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("moncradel_kitchen_auth");
    const token = localStorage.getItem("moncradel_kitchen_token");
    const hasCookie = document.cookie.includes("moncradel_kitchen_token=");

    if (saved === "true" && token && hasCookie) {
      setIsAuthenticated(true);
      // Check profile completion after auth is confirmed
      checkProfileCompletion();
    } else {
      // If auth flag is set but token or cookie is missing, clean up to prevent redirect loops
      if (saved === "true") {
        localStorage.removeItem("moncradel_kitchen_auth");
        localStorage.removeItem("moncradel_kitchen_token");
      }
      setIsAuthenticated(false);
    }
    setIsAuthLoading(false);
  }, [checkProfileCompletion]);

  const loginWithOtp = (phone: string, otp: string): boolean => {
    if (phone && otp.length >= 4) {
      setIsAuthenticated(true);
      localStorage.setItem("moncradel_kitchen_auth", "true");
      setShowAuthModal(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsProfileComplete(true);
    localStorage.removeItem("moncradel_kitchen_auth");
    localStorage.removeItem("moncradel_kitchen_token");
    localStorage.removeItem("moncradel_kitchen_user");
    localStorage.removeItem("moncradel_splash_seen");
    localStorage.removeItem("token");
    // Clear the auth cookie
    document.cookie = "moncradel_kitchen_token=; path=/; max-age=0; SameSite=Strict";
  };

  const recheckProfile = useCallback(async () => {
    await checkProfileCompletion();
  }, [checkProfileCompletion]);

  return (
    <KitchenAuthContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
        isProfileComplete,
        isProfileChecking,
        showAuthModal,
        setShowAuthModal,
        showApkModal,
        setShowApkModal,
        authMode,
        setAuthMode,
        loginWithOtp,
        logout,
        recheckProfile,
      }}
    >
      {children}
    </KitchenAuthContext.Provider>
  );
}

export function useKitchenAuth() {
  const context = useContext(KitchenAuthContext);
  if (!context) {
    throw new Error("useKitchenAuth must be used within a KitchenAuthProvider");
  }
  return context;
}
