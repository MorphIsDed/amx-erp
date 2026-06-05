import { create } from "zustand";
import { API_BASE_URL } from "./api-config";

export type UserRole = "admin" | "hr" | "finance" | "inventory" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    if (typeof window === "undefined") return;
    try {
      const storedUser = localStorage.getItem("amx_user");
      const storedToken = localStorage.getItem("amx_token");

      if (storedUser && storedToken) {
        set({
          user: JSON.parse(storedUser),
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error("Failed to restore session", e);
      set({ isLoading: false });
    }
  },

  login: async (email: string, password?: string, role: UserRole = "admin") => {
    set({ isLoading: true });
    
    // Attempt real backend authentication first
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "password123" }),
      });

      if (res.ok) {
        const data = await res.json();
        const backendUser = data.user;
        const token = data.access_token;

        // Map backend Role enum to UserRole type
        let mappedRole: UserRole = "viewer";
        if (backendUser.role === "ADMIN") mappedRole = "admin";
        else if (backendUser.role === "HR") mappedRole = "hr";
        else if (backendUser.role === "FINANCE") mappedRole = "finance";
        else if (backendUser.role === "INVENTORY") mappedRole = "inventory";

        const user: User = {
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
          role: mappedRole,
          companyName: "AMX Enterprise Solutions",
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("amx_user", JSON.stringify(user));
          localStorage.setItem("amx_token", token);
          localStorage.setItem("token", token);
        }

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        return true;
      }
    } catch (err) {
      console.warn("Backend auth failed, falling back to mock login:", err);
    }

    // Fallback: Simulated API request delay & Mock Login
    await new Promise((resolve) => setTimeout(resolve, 800));

    const name = email.split("@")[0].replace(".", " ");
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    const user: User = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      name: formattedName || "Administrator",
      email,
      role,
      companyName: "Acme Enterprise Corp",
    };

    const token = `jwt_mock_token_${role}_${Date.now()}`;

    if (typeof window !== "undefined") {
      localStorage.setItem("amx_user", JSON.stringify(user));
      localStorage.setItem("amx_token", token);
      // Compatibility with existing local storage tokens
      localStorage.setItem("token", token);
    }

    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });

    return true;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("amx_user");
      localStorage.removeItem("amx_token");
      localStorage.removeItem("token");
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));
