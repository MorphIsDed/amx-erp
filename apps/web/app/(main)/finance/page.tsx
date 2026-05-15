"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Plus,
  ArrowUpRight,
  FileText,
  Clock,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Financial Control</h1>
          <p className="text-text-muted mt-1">Real-time treasury management and invoicing.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/finance/invoices">View Invoices</Link>
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinanceStat 
          title="Total Revenue" 
          value="₹84.2M" 
          change="+18%" 
          trend="up" 
          icon={TrendingUp} 
        />
        <FinanceStat 
          title="Outstanding" 
          value="₹12.4M" 
          change="+2.4%" 
          trend="down" 
          icon={Clock} 
        />
        <FinanceStat 
          title="Cash in Hand" 
          value="₹45.1M" 
          change="+5.1%" 
          trend="up" 
          icon={DollarSign} 
        />
        <FinanceStat 
          title="Tax Liability" 
          value="₹4.2M" 
          change="Estimated" 
          trend="neutral" 
          icon={FileText} 
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE CHART */}
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Cash Flow</CardTitle>
              <p className="text-xs text-text-muted mt-1">Monthly breakdown of income vs expenses</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-[10px] font-bold text-emerald-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                INCOME
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-danger/10 text-[10px] font-bold text-danger">
                <div className="w-1.5 h-1.5 rounded-full bg-danger" />
                EXPENSES
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] flex items-end justify-between px-8 pb-8">
            {[40, 60, 45, 80, 55, 90, 75, 85, 65, 95, 100, 80].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group w-full max-w-[32px]">
                <div className="w-full flex items-end gap-1 h-[250px]">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="flex-1 bg-primary/40 group-hover:bg-primary transition-all rounded-t-sm" 
                  />
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h * 0.6}%` }}
                    className="flex-1 bg-danger/40 group-hover:bg-danger transition-all rounded-t-sm" 
                  />
                </div>
                <span className="text-[10px] text-text-muted font-medium">M{i+1}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RECENT INVOICES */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Upcoming Receivables</CardTitle>
            <p className="text-xs text-text-muted mt-1">Highest value pending invoices</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { client: "Global Tech Inc", amount: "₹450,000", date: "May 20", status: "Sent" },
              { client: "SoftBank Group", amount: "₹820,000", date: "May 25", status: "Sent" },
              { client: "TCS Solutions", amount: "₹120,000", date: "Jun 02", status: "Draft" },
              { client: "Reliance Ind", amount: "₹1.2M", date: "Jun 10", status: "Sent" },
            ].map((inv, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted group-hover:border-primary/50 transition-all">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-main">{inv.client}</p>
                    <p className="text-[10px] text-text-muted">Due {inv.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-main">{inv.amount}</p>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                    inv.status === "Sent" ? "bg-blue-500/10 text-blue-500" : "bg-text-muted/10 text-text-muted"
                  )}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs text-primary" asChild>
              <Link href="/finance/invoices">View All Invoices <ArrowUpRight className="ml-2 w-3 h-3" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinanceStat({ title, value, change, trend, icon: Icon }: any) {
  return (
    <Card variant="default" className="relative overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{title}</p>
          <Icon className="w-4 h-4 text-text-muted" />
        </div>
        <div className="mt-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-text-main">{value}</h2>
          <div className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            trend === "up" ? "bg-emerald-500/10 text-emerald-500" : 
            trend === "down" ? "bg-danger/10 text-danger" : "bg-surface text-text-muted"
          )}>
            {change}
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full" />
      <motion.div 
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        className="absolute bottom-0 left-0 h-1 bg-primary" 
      />
    </Card>
  );
}
