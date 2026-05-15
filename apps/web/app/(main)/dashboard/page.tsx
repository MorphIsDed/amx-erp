"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Executive Overview</h1>
          <p className="text-text-muted mt-1">Welcome back. Here is what is happening with your enterprise today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium">
            May 15, 2026
          </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget 
          title="Total Revenue" 
          value="₹24.8M" 
          change="+12.5%" 
          trend="up" 
          icon={TrendingUp} 
          color="text-emerald-500"
        />
        <StatWidget 
          title="Active Employees" 
          value="1,240" 
          change="+4" 
          trend="up" 
          icon={Users} 
          color="text-blue-500"
        />
        <StatWidget 
          title="Open Orders" 
          value="312" 
          change="-8.2%" 
          trend="down" 
          icon={ShoppingBag} 
          color="text-amber-500"
        />
        <StatWidget 
          title="System Health" 
          value="99.9%" 
          change="Optimal" 
          trend="neutral" 
          icon={Activity} 
          color="text-primary"
        />
      </div>

      {/* CHARTS / MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center border-t border-border/50">
            <p className="text-text-muted text-sm italic">Premium Charts Engine (Recharts) ready to be wired.</p>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Enterprise Pulse</CardTitle>
            <p className="text-xs text-text-muted mt-1">Real-time audit and activity feed</p>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <ActivityTimeline />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatWidget({ title, value, change, trend, icon: Icon, color }: any) {
  return (
    <Card variant="default" className="group hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-lg bg-surface border border-border group-hover:border-primary/30", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={cn(
            "flex items-center text-xs font-medium px-2 py-1 rounded-full",
            trend === "up" ? "text-emerald-500 bg-emerald-500/10" : 
            trend === "down" ? "text-danger bg-danger/10" : "text-text-muted bg-surface"
          )}>
            {trend === "up" && <ArrowUpRight className="w-3 h-3 mr-1" />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3 mr-1" />}
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
