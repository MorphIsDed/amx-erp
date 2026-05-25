import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  read: boolean;
  timestamp: string;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, "id" | "read" | "timestamp">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [
        {
          id: "notif_0",
          title: "System Update Complete",
          message: "AMX ERP v2.5 has been successfully deployed.",
          type: "INFO",
          read: false,
          timestamp: new Date().toISOString(),
        }
      ],
      addNotification: (n) => set((state) => ({
        notifications: [
          {
            ...n,
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            read: false,
            timestamp: new Date().toISOString(),
          },
          ...state.notifications,
        ]
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      })),
      clearAll: () => set({ notifications: [] })
    }),
    {
      name: "amx-notifications",
    }
  )
);
