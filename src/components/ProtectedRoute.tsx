"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['kitchen', 'admin', 'superadmin'], 
  redirectPath = "/orders"
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("moncradel_kitchen_user");
    if (!userStr) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (allowedRoles.includes(user.role)) {
        setIsAuthorized(true);
      } else {
        console.warn(`Role ${user.role} is not authorized for this route.`);
        router.replace(redirectPath);
      }
    } catch (e) {
      router.replace("/login");
    }
  }, [allowedRoles, redirectPath, router]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#114227]"></div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
