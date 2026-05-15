"use client";

import { useEffect, useState } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:3001/notifications", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        setNotifications(data);
        
        const countRes = await fetch("http://localhost:3001/notifications/unread-count", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
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

    const eventSource = new EventSource(`http://localhost:3001/notifications/stream?token=${token}`);

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
      await fetch(`http://localhost:3001/notifications/${id}/read`, {
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
