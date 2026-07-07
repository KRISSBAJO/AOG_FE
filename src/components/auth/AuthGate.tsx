"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMe, clearAuthSession, saveWorkspaceFromUser } from "@/lib/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    getMe()
      .then((user) => {
        saveWorkspaceFromUser(user);
        setAllowed(true);
      })
      .catch(() => {
        clearAuthSession();
        router.replace("/sign-in");
      });
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Loading workspace...
      </div>
    );
  }

  return <>{children}</>;
}
