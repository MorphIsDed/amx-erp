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

const purchaseOrders = [
  { id: "PO-2024-001", vendor: "Logitech Global", warehouse: "Main Hub", amount: "₹1,24,000", status: "Received", date: "May 10" },
  { id: "PO-2024-002", vendor: "Apple Inc", warehouse: "Mumbai Hub", amount: "₹4,50,000", status: "Ordered", date: "May 12" },
  { id: "PO-2024-003", vendor: "Dell Technologies", warehouse: "Main Hub", amount: "₹82,000", status: "Pending Approval", date: "May 14" },
  { id: "PO-2024-004", vendor: "Samsung Elec", warehouse: "Delhi Depot", amount: "₹15,200", status: "Draft", date: "May 15" },
];

export default function PurchaseOrdersPage() {
  const [filter, setFilter] = useState("all");

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
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-surface/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-text-main">{po.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-text-main">{po.vendor}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">{po.warehouse}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-text-main">{po.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <POStatusBadge status={po.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {po.status === "Ordered" && (
                        <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold uppercase">
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
  const styles: any = {
    Received: "bg-emerald-500/10 text-emerald-500",
    Ordered: "bg-blue-500/10 text-blue-500",
    "Pending Approval": "bg-amber-500/10 text-amber-500",
    Draft: "bg-text-muted/10 text-text-muted",
    Cancelled: "bg-danger/10 text-danger",
  };

  const icons: any = {
    Received: <CheckCircle2 className="w-3 h-3 mr-1.5" />,
    Ordered: <Truck className="w-3 h-3 mr-1.5" />,
    "Pending Approval": <Clock className="w-3 h-3 mr-1.5" />,
    Draft: <FileText className="w-3 h-3 mr-1.5" />,
    Cancelled: <AlertCircle className="w-3 h-3 mr-1.5" />,
  };

  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      styles[status]
    )}>
      {icons[status]}
      {status}
    </div>
  );
}
