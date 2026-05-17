"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../lib/api-config";

export function useInventoryStream() {
  const [stockUpdates, setStockUpdates] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const eventSource = new EventSource(API_ENDPOINTS.INVENTORY_STREAM(token));

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStockUpdates(prev => [data, ...prev]);
    };

    eventSource.onerror = (err) => {
      console.error("SSE Inventory Stream error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { stockUpdates };
}
