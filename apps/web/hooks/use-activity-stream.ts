"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../lib/api-config";

export function useActivityStream() {
  const [activityUpdates, setActivityUpdates] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const eventSource = new EventSource(API_ENDPOINTS.ACTIVITY_STREAM(token));

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setActivityUpdates(prev => [data, ...prev]);
    };

    eventSource.onerror = (err) => {
      console.error("SSE Activity Stream error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { activityUpdates };
}
