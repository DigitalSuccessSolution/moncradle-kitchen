"use client";

import React, { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import MobileLogin from "./MobileLogin";
import MobileRegister from "./MobileRegister";

type AuthStep = "splash" | "login" | "register";

interface MobileAuthFlowProps {
  initialMode: "login" | "register";
}

export default function MobileAuthFlow({ initialMode }: MobileAuthFlowProps) {
  const [step, setStep] = useState<AuthStep | null>(null);

  useEffect(() => {
    const splashSeen = localStorage.getItem("moncradel_splash_seen");
    if (!splashSeen) {
      setStep("splash");
    } else {
      setStep(initialMode);
    }
  }, [initialMode]);

  const handleSplashComplete = () => {
    localStorage.setItem("moncradel_splash_seen", "true");
    setStep(initialMode);
  };

  // Prevent flicker before reading localStorage
  if (!step) return <div className="min-h-screen w-full bg-[#F8F9FA]" />;

  return (
    <>
      {step === "splash" && <SplashScreen onComplete={handleSplashComplete} />}
      {step === "login" && <MobileLogin onSwitchToRegister={() => setStep("register")} />}
      {step === "register" && <MobileRegister onSwitchToLogin={() => setStep("login")} />}
    </>
  );
}
