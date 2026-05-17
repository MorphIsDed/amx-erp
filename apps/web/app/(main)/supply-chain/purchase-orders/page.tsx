"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  PackageCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/api-config";

export default function PurchaseOrdersPage() {
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.PURCHASE_ORDERS, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch POs");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReceive = async (id: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.PURCHASE_ORDER_STATUS(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: 'RECEIVED' })
      });
      if (res.ok) {
        fetchOrders(); // Refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-text-faint">Initializing Procurement Systems...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Purchase Orders</h1>
          <p className="text-text-muted mt-1">Manage procurement and vendor shipments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create PO
          </Button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-border p-2 rounded-xl">
        <div className="flex items-center gap-1">
          {["all", "draft", "pending approval", "ordered", "received"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                filter === f ? "bg-card text-primary shadow-sm" : "text-text-muted hover:text-text-main"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            placeholder="Search POs..." 
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* PO TABLE */}
      <Card variant="default" className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">PO Number</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Vendor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Warehouse</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders
                .filter(o => {
                  if (filter === "all") return true;
                  return o.status.toLowerCase().replace('_', ' ') === filter;
                })
                .map((po) => (
                <tr key={po.id} className="hover:bg-surface/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-text-main">{po.poNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-text-main">{po.vendor.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">{po.warehouse.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-text-main">₹{po.totalAmount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <POStatusBadge status={po.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {po.status === "ORDERED" && (
                        <Button 
                          onClick={() => handleReceive(po.id)}
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-[10px] font-bold uppercase"
                        >
                          <PackageCheck className="w-3.5 h-3.5 mr-1.5" />
                          Receive
                        </Button>
                      )}
                      <button className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text-main transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function POStatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const styles: any = {
    RECEIVED: "bg-emerald-500/10 text-emerald-500",
    ORDERED: "bg-blue-500/10 text-blue-500",
    PENDING_APPROVAL: "bg-amber-500/10 text-amber-500",
    DRAFT: "bg-text-muted/10 text-text-muted",
    CANCELLED: "bg-danger/10 text-danger",
  };

  const icons: any = {
    RECEIVED: <CheckCircle2 className="w-3 h-3 mr-1.5" />,
    ORDERED: <Truck className="w-3 h-3 mr-1.5" />,
    PENDING_APPROVAL: <Clock className="w-3 h-3 mr-1.5" />,
    DRAFT: <FileText className="w-3 h-3 mr-1.5" />,
    CANCELLED: <AlertCircle className="w-3 h-3 mr-1.5" />,
  };

  const label = status.replace('_', ' ');

  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      styles[s] || styles.DRAFT
    )}>
      {icons[s] || icons.DRAFT}
      {label}
    </div>
  );
}
