"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      // Use window.location.href to guarantee redirect, as Next.js router can sometimes hang on initial load in layout
      window.location.href = "/";
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-[#7cae98] rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
