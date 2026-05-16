"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Package, Truck, Warehouse, AlertTriangle, History, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/api-config";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } };

export default function SupplyChainOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.WAREHOUSES}/stats/overview`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-text-faint">Initializing Spatial Supply Chain...</div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><span className="text-gradient-primary">Supply Chain</span>{" "}<span className="text-text-main">& Inventory</span></h1>
          <p className="text-text-muted mt-2 text-sm">Real-time stock tracking and warehouse operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild><Link href="/supply-chain/inventory">Inventory Master</Link></Button>
          <Button><Plus className="w-4 h-4 mr-2" />Add Product</Button>
        </div>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <InventoryStat title="Stock Valuation" value={`₹${(stats?.totalValuation / 1000000).toFixed(1)}M`} change="+8.5%" trend="up" icon={Package} gradient="from-primary to-cyan" />
        <InventoryStat title="Active SKUs" value={stats?.products || 0} change="+12" trend="up" icon={Truck} gradient="from-info to-accent" />
        <InventoryStat title="Total Warehouses" value={stats?.warehouses || 0} change="Optimal" trend="neutral" icon={Warehouse} gradient="from-success to-primary" />
        <InventoryStat title="Low Stock Items" value="0" change="-2" trend="down" icon={AlertTriangle} gradient="from-warning to-rose" />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader><CardTitle>Warehouse Distribution</CardTitle><p className="text-xs text-text-faint mt-1">Stock levels across all physical locations</p></CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-center p-8 space-y-7">
            {stats?.distribution?.map((w: any, i: number) => (
              <WarehouseProgress 
                key={w.id} 
                name={w.name} 
                value={Math.min(100, w.level)} 
                color={i % 2 === 0 ? "from-primary to-cyan" : "from-info to-accent"} 
                glow={i % 2 === 0 ? "rgba(52,211,153,0.3)" : "rgba(96,165,250,0.3)"} 
              />
            ))}
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/20">
            <CardTitle>Recent Ledger</CardTitle><History className="w-4 h-4 text-text-faint" />
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            {stats?.recentMovements?.map((m: any, i: number) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold",
                    m.type === "IN" ? "bg-success/10 text-success" : m.type === "OUT" ? "bg-danger/10 text-danger" : "bg-surface text-text-faint"
                  )}>{m.type}</div>
                  <div><p className="text-sm font-semibold text-text-main leading-tight truncate max-w-[120px]">{m.product.name}</p><p className="text-[10px] text-text-faint">{m.reason || "Inventory action"}</p></div>
                </div>
                <div className="text-right">
                  <p className={cn("text-xs font-bold font-mono", m.type === "IN" ? "text-success" : "text-danger")}>{m.type === "IN" ? "+" : "-"}{m.quantity}</p>
                  <p className="text-[10px] text-text-faint">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function InventoryStat({ title, value, change, trend, icon: Icon, gradient }: any) {
  return (
    <motion.div variants={item}>
      <Card variant="default" className="group hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
        <div className={cn("absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-30 group-hover:opacity-70 transition-opacity", gradient)} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-surface/80 border border-border/30 group-hover:border-primary/20 transition-all duration-300"><Icon className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" /></div>
            <div className={cn("flex items-center text-xs font-semibold px-2.5 py-1 rounded-full", trend === "up" ? "bg-success/10 text-success" : trend === "down" ? "bg-danger/10 text-danger" : "bg-surface text-text-faint")}>{change}</div>
          </div>
          <div className="mt-4"><p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</p><h2 className="text-2xl font-bold text-text-main mt-1 tracking-tight">{value}</h2></div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WarehouseProgress({ name, value, color, glow }: any) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs font-medium"><span className="text-text-main">{name}</span><span className="text-text-faint font-mono">{value}%</span></div>
      <div className="h-2 w-full bg-border/20 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className={cn("h-full rounded-full bg-gradient-to-r relative", color)} style={{ boxShadow: `0 0 12px -2px ${glow}` }} />
      </div>
    </div>
  );
}
