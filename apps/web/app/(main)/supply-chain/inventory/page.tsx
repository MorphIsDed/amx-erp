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
  Package,
  ArrowUpRight,
  History,
  AlertTriangle,
  MoveHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const inventory = [
  { sku: "LOG-MX3", name: "Logitech MX Master 3", category: "Peripherals", stock: 142, unit: "pcs", status: "In Stock" },
  { sku: "MAC-M3P", name: "MacBook Pro M3 14\"", category: "Laptops", stock: 12, unit: "pcs", status: "Low Stock" },
  { sku: "DEL-U27", name: "Dell UltraSharp 27\"", category: "Monitors", stock: 45, unit: "pcs", status: "In Stock" },
  { sku: "KEY-K2V", name: "Keychron K2 V2", category: "Peripherals", stock: 8, unit: "pcs", status: "Low Stock" },
  { sku: "APL-IP15", name: "iPhone 15 Pro 256GB", category: "Mobile", stock: 0, unit: "pcs", status: "Out of Stock" },
];

export default function InventoryMasterPage() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Inventory Master</h1>
          <p className="text-text-muted mt-1">Full product catalog and real-time stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <MoveHorizontal className="w-4 h-4 mr-2" />
            Stock Transfer
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-border p-2 rounded-xl">
        <div className="flex items-center gap-1">
          {["all", "in stock", "low stock", "out of stock"].map((f) => (
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
            placeholder="Search SKU or Name..." 
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* INVENTORY TABLE */}
      <Card variant="default" className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">SKU</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inventory.map((item) => (
                <tr key={item.sku} className="hover:bg-surface/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-primary px-2 py-1 bg-primary/5 rounded border border-primary/10">
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-text-main">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">{item.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-main">{item.stock} {item.unit}</span>
                      <div className="w-24 h-1 bg-border rounded-full mt-1 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            item.stock > 50 ? "bg-emerald-500" : item.stock > 0 ? "bg-amber-500" : "bg-danger"
                          )} 
                          style={{ width: `${Math.min(100, (item.stock / 200) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StockStatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text-main transition-colors">
                        <History className="w-4 h-4" />
                      </button>
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

function StockStatusBadge({ status }: { status: string }) {
  const styles: any = {
    "In Stock": "bg-emerald-500/10 text-emerald-500",
    "Low Stock": "bg-amber-500/10 text-amber-500",
    "Out of Stock": "bg-danger/10 text-danger",
  };

  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      styles[status]
    )}>
      {status === "Low Stock" && <AlertTriangle className="w-3 h-3 mr-1.5" />}
      {status}
    </div>
  );
}
