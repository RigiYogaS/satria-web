"use client";

import { useSession, signOut } from "next-auth/react";

export const useAuth = () => {
  const { data: session, status } = useSession();

  const user = session?.user || null;
  const loading = status === "loading";

  const logout = () => {
    signOut({ callbackUrl: "/auth-routing/login" });
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
  };
};
