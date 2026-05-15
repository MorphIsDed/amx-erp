"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CreditCard, TrendingUp, DollarSign, Plus, ArrowUpRight, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } };

export default function FinancePage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><span className="text-gradient-primary">Financial</span>{" "}<span className="text-text-main">Control</span></h1>
          <p className="text-text-muted mt-2 text-sm">Real-time treasury management and invoicing.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild><Link href="/finance/invoices">View Invoices</Link></Button>
          <Button><Plus className="w-4 h-4 mr-2" />New Invoice</Button>
        </div>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <FinanceStat title="Total Revenue" value="₹84.2M" change="+18%" trend="up" icon={TrendingUp} gradient="from-primary to-cyan" />
        <FinanceStat title="Outstanding" value="₹12.4M" change="+2.4%" trend="down" icon={Clock} gradient="from-warning to-rose" />
        <FinanceStat title="Cash in Hand" value="₹45.1M" change="+5.1%" trend="up" icon={DollarSign} gradient="from-success to-primary" />
        <FinanceStat title="Tax Liability" value="₹4.2M" change="Estimated" trend="neutral" icon={FileText} gradient="from-accent to-info" />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Cash Flow</CardTitle><p className="text-xs text-text-faint mt-1">Monthly breakdown of income vs expenses</p></div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 text-[10px] font-bold text-success"><div className="w-1.5 h-1.5 rounded-full bg-success" />INCOME</div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-danger/10 text-[10px] font-bold text-danger"><div className="w-1.5 h-1.5 rounded-full bg-danger" />EXPENSES</div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] flex items-end justify-between px-6 pb-8 border-t border-border/15">
            {[40, 60, 45, 80, 55, 90, 75, 85, 65, 95, 100, 80].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group w-full max-w-[28px]">
                <div className="w-full flex items-end gap-0.5 h-[260px]">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }} className="flex-1 bg-gradient-to-t from-primary/50 to-primary/15 group-hover:from-primary group-hover:to-primary/40 rounded-t-sm transition-all relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-primary shadow-[0_0_6px_rgba(52,211,153,0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${h * 0.6}%` }} transition={{ duration: 0.7, delay: i * 0.05 + 0.1, ease: [0.16, 1, 0.3, 1] }} className="flex-1 bg-gradient-to-t from-danger/40 to-danger/10 group-hover:from-danger group-hover:to-danger/40 rounded-t-sm transition-all relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-danger shadow-[0_0_6px_rgba(248,113,113,0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>
                <span className="text-[10px] text-text-faint font-mono">M{i + 1}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card variant="default" className="overflow-hidden">
          <CardHeader className="border-b border-border/20"><CardTitle>Upcoming Receivables</CardTitle><p className="text-xs text-text-faint mt-1">Highest value pending invoices</p></CardHeader>
          <CardContent className="space-y-5 pt-5">
            {[
              { client: "Global Tech Inc", amount: "₹450,000", date: "May 20", status: "Sent" },
              { client: "SoftBank Group", amount: "₹820,000", date: "May 25", status: "Sent" },
              { client: "TCS Solutions", amount: "₹120,000", date: "Jun 02", status: "Draft" },
              { client: "Reliance Ind", amount: "₹1.2M", date: "Jun 10", status: "Sent" },
            ].map((inv, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface/80 border border-border/30 flex items-center justify-center text-text-faint group-hover:border-primary/30 group-hover:text-primary transition-all"><FileText className="w-4 h-4" /></div>
                  <div><p className="text-sm font-semibold text-text-main">{inv.client}</p><p className="text-[10px] text-text-faint">Due {inv.date}</p></div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-main font-mono">{inv.amount}</p>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", inv.status === "Sent" ? "bg-info/10 text-info" : "bg-surface text-text-faint")}>{inv.status}</span>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs text-primary" asChild><Link href="/finance/invoices">View All Invoices <ArrowUpRight className="ml-2 w-3 h-3" /></Link></Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function FinanceStat({ title, value, change, trend, icon: Icon, gradient }: any) {
  return (
    <motion.div variants={item}>
      <Card variant="default" className="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-text-faint uppercase tracking-wider">{title}</p><Icon className="w-4 h-4 text-text-faint group-hover:text-primary transition-colors" /></div>
          <div className="mt-4 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-text-main tracking-tight">{value}</h2>
            <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", trend === "up" ? "bg-success/10 text-success" : trend === "down" ? "bg-danger/10 text-danger" : "bg-surface text-text-faint")}>{change}</div>
          </div>
        </CardContent>
        <div className={cn("absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-30 group-hover:opacity-70 transition-opacity", gradient)} />
      </Card>
    </motion.div>
  );
}
