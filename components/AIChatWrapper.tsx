"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AIChat from "./AIChat";

/**
 * Wrapper component that conditionally renders AI chat based on route and auth status
 */
export default function AIChatWrapper() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [pathname]);

  // Don't show on public profile pages (format: /username)
  const isPublicProfile = pathname?.match(/^\/[^\/]+$/) && !pathname.startsWith("/dashboard") && !pathname.startsWith("/editor");
  
  // Don't show on login/register/landing pages
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/signup" || pathname === "/";

  // Only show if authenticated and not on public/auth pages
  const shouldShow = isAuthenticated && !isPublicProfile && !isAuthPage;

  if (!shouldShow) return null;

  return <AIChat />;
}
