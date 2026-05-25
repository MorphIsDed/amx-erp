"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, UserRole } from "@/lib/auth-store";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router, pathname, allowedRoles]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        {/* Sleek loader */}
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-80" />
          <div className="absolute w-14 h-14 rounded-full border border-primary/20 animate-ping opacity-30" />
        </div>
        <p className="text-text-muted text-sm font-medium animate-pulse">
          Securing session context...
        </p>
      </div>
    );
  }

  // Double-check role if specified
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
