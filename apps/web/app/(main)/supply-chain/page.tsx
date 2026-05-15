"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Package, 
  Truck, 
  Warehouse, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SupplyChainOverview() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Supply Chain & Inventory</h1>
          <p className="text-text-muted mt-1">Real-time stock tracking and warehouse operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/supply-chain/inventory">Inventory Master</Link>
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InventoryStat 
          title="Stock Valuation" 
          value="₹14.2M" 
          change="+8.5%" 
          trend="up" 
          icon={Package} 
          color="text-primary"
        />
        <InventoryStat 
          title="Active SKUs" 
          value="842" 
          change="+12" 
          trend="up" 
          icon={Truck} 
          color="text-blue-500"
        />
        <InventoryStat 
          title="Total Warehouses" 
          value="4" 
          change="Optimal" 
          trend="neutral" 
          icon={Warehouse} 
          color="text-emerald-500"
        />
        <InventoryStat 
          title="Low Stock Items" 
          value="18" 
          change="-2" 
          trend="down" 
          icon={AlertTriangle} 
          color="text-amber-500"
        />
      </div>

      {/* CHARTS / DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STOCK DISTRIBUTION */}
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Warehouse Distribution</CardTitle>
            <p className="text-xs text-text-muted mt-1">Stock levels across all physical locations</p>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-center p-8 space-y-6">
            <WarehouseProgress name="Main Hub - Mumbai" value={75} color="bg-primary" />
            <WarehouseProgress name="North Depot - Delhi" value={45} color="bg-blue-500" />
            <WarehouseProgress name="South Hub - Bengaluru" value={62} color="bg-emerald-500" />
            <WarehouseProgress name="East Depot - Kolkata" value={28} color="bg-amber-500" />
          </CardContent>
        </Card>

        {/* RECENT MOVEMENTS */}
        <Card variant="default">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Ledger</CardTitle>
            <History className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { type: "IN", item: "Logitech MX Master 3", qty: "+50", date: "2h ago", reason: "Goods Receipt" },
              { type: "OUT", item: "MacBook Pro M3", qty: "-5", date: "4h ago", reason: "Order #842" },
              { type: "TRANS", item: "Dell U2723QE", qty: "20", date: "Yesterday", reason: "Internal Transfer" },
              { type: "ADJ", item: "Keychron K2", qty: "-2", date: "Yesterday", reason: "Damaged Stock" },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold",
                    m.type === "IN" ? "bg-emerald-500/10 text-emerald-500" :
                    m.type === "OUT" ? "bg-danger/10 text-danger" : "bg-surface text-text-muted"
                  )}>
                    {m.type}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-main leading-tight truncate max-w-[120px]">{m.item}</p>
                    <p className="text-[10px] text-text-muted">{m.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-xs font-bold",
                    m.qty.startsWith("+") ? "text-emerald-500" : m.qty.startsWith("-") ? "text-danger" : "text-text-main"
                  )}>{m.qty}</p>
                  <p className="text-[10px] text-text-muted">{m.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InventoryStat({ title, value, change, trend, icon: Icon, color }: any) {
  return (
    <Card variant="default" className="group hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-lg bg-surface border border-border group-hover:border-primary/30", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={cn(
            "flex items-center text-xs font-medium px-2 py-1 rounded-full",
            trend === "up" ? "bg-emerald-500/10 text-emerald-500" : 
            trend === "down" ? "bg-danger/10 text-danger" : "bg-surface text-text-muted"
          )}>
            {change}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-text-muted">{title}</p>
          <h2 className="text-2xl font-bold text-text-main mt-1">{value}</h2>
        </div>
      </CardContent>
    </Card>
  );
}

function WarehouseProgress({ name, value, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-text-main">{name}</span>
        <span className="text-text-muted">{value}% Capacity</span>
      </div>
      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={cn("h-full", color)}
        />
      </div>
    </div>
  );
}
