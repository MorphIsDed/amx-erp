"use client";

import { useEffect, useState } from "react";
import { useNotificationStore } from "../lib/notification-store";

export function useNotifications() {
  const { notifications, addNotification, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate real-time notifications
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      // 10% chance every 10 seconds to receive a real-time mock notification
      if (Math.random() < 0.1) {
        const events = [
          { title: "Low Stock Alert", message: "MacBook Pro 16 M3 stock has dropped below 5 units.", type: "WARNING" as const },
          { title: "PO Approved", message: "Purchase Order PO-2026-004 has been approved.", type: "SUCCESS" as const },
          { title: "New Employee Onboarded", message: "A new engineer has joined the Product team.", type: "INFO" as const },
        ];
        const evt = events[Math.floor(Math.random() * events.length)];
        addNotification(evt);
        
        // Show browser notification if permitted
        if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
          new Notification(evt.title, { body: evt.message });
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [mounted, addNotification]);

  // Handle Hydration empty state
  const safeNotifications = mounted ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  return { 
    notifications: safeNotifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  };
}
