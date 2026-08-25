"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKitchenAuth } from "@/context/KitchenAuthContext";

export default function Root() {
  const { isAuthenticated, isAuthLoading } = useKitchenAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  return null;
}
