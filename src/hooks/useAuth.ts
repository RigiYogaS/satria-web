"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id_user: number;
  email: string;
  nama: string;
  jabatan: string;
  role: string;
  status: string;
  divisi: {
    id_divisi: number;
    nama_divisi: string;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        logout();
      }
    } else {
      router.push("/auth/login");
    }
    
    setLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const updateUser = (newUserData: User) => {
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  return {
    user,
    loading,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };
};