"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../lib/api-config";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    const fetchNotifications = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.NOTIFICATIONS, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setNotifications(data);
        
        const countRes = await fetch(API_ENDPOINTS.NOTIFICATIONS_UNREAD, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (!countRes.ok) throw new Error(`HTTP error! status: ${countRes.status}`);
        const countData = await countRes.json();
        setUnreadCount(countData);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();

    // SSE Stream
    const token = localStorage.getItem("token");
    if (!token) return;

    const eventSource = new EventSource(API_ENDPOINTS.NOTIFICATIONS_STREAM(token));

    eventSource.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Browser notification
      if (Notification.permission === "granted") {
        new Notification(newNotification.title, { body: newNotification.message });
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(API_ENDPOINTS.NOTIFICATIONS_READ(id), {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  return { notifications, unreadCount, markAsRead };
}
