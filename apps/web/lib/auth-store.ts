import { create } from "zustand";

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
  login: (email: string, role: UserRole) => Promise<boolean>;
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

  login: async (email: string, role: UserRole) => {
    set({ isLoading: true });
    
    // Simulate API request delay
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
