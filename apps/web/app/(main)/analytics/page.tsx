"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, BrainCircuit, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } };

const data = [
  { name: "Jan", actual: 4000, predicted: 4100 }, { name: "Feb", actual: 3000, predicted: 3200 },
  { name: "Mar", actual: 2000, predicted: 2150 }, { name: "Apr", actual: 2780, predicted: 2900 },
  { name: "May", actual: 1890, predicted: 2100 }, { name: "Jun", actual: 2390, predicted: 2500 },
  { name: "Jul", actual: null, predicted: 3100 }, { name: "Aug", actual: null, predicted: 3400 },
  { name: "Sep", actual: null, predicted: 3900 },
];

export default function AnalyticsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      {/* AI HEADER */}
      <motion.div variants={item} className="relative p-8 rounded-2xl border border-primary/15 overflow-hidden bg-card/40 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/[0.06] blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/[0.04] blur-[100px] rounded-full -ml-10 -mb-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-vivid to-cyan flex items-center justify-center shadow-lg shadow-primary/25">
              <BrainCircuit className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <span className="text-gradient-primary">AI</span>{" "}<span className="text-text-main">Business Intelligence</span>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">v2.4 PRO</span>
              </h1>
              <p className="text-text-muted mt-2 max-w-md text-sm">Predictive modeling active. Analyzing historical patterns to forecast revenue, demand, and risk.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Card variant="glass" className="p-4 border-primary/20">
              <p className="text-[10px] font-bold text-text-faint uppercase tracking-wider">Confidence</p>
              <p className="text-2xl font-bold text-primary mt-1 font-mono">94.2%</p>
            </Card>
            <Card variant="glass" className="p-4 border-info/20">
              <p className="text-[10px] font-bold text-text-faint uppercase tracking-wider">Anomalies</p>
              <p className="text-2xl font-bold text-info mt-1 font-mono">0</p>
            </Card>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Revenue Forecast</CardTitle><p className="text-xs text-text-faint mt-1">Prophetic projection based on 24-month variance</p></div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[10px] font-bold text-text-faint uppercase">Actual</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary/30 border border-dashed border-primary" /><span className="text-[10px] font-bold text-text-faint uppercase">AI Prediction</span></div>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.3} /><stop offset="95%" stopColor="#34d399" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" strokeOpacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#4a5568", fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#4a5568", fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: "#131820", borderColor: "#1e293b", borderRadius: "12px", fontSize: "12px", boxShadow: "0 20px 60px -15px rgba(0,0,0,0.7)" }} itemStyle={{ color: "#34d399" }} />
                <Area type="monotone" dataKey="predicted" stroke="#34d399" strokeDasharray="5 5" strokeOpacity={0.4} fill="transparent" />
                <Area type="monotone" dataKey="actual" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card variant="default">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/20"><Sparkles className="w-4 h-4 text-primary" /><CardTitle>AI Insights</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-4">
              <InsightItem icon={TrendingUp} title="Revenue Surge" description="AI predicts 18% growth in Q3 due to seasonal patterns." type="positive" />
              <InsightItem icon={Zap} title="Supply Chain Risk" description="3 core SKUs predicted to deplete within 14 days." type="warning" />
              <InsightItem icon={Target} title="Cost Optimization" description="12.4% savings possible by consolidating vendor orders." type="info" />
            </CardContent>
          </Card>
          <Card variant="default" className="bg-primary/[0.03] border-primary/15">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary-vivid to-cyan text-slate-950"><BrainCircuit className="w-5 h-5" /></div>
                <h3 className="font-bold text-text-main text-sm">AI Recommendation</h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mb-4">Increase stock for Logitech MX Master 3 by 25% before June 15 to meet projected demand.</p>
              <Button size="sm" className="w-full">Generate PO Now</Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InsightItem({ icon: Icon, title, description, type }: any) {
  const colors: Record<string, string> = { positive: "text-success bg-success/10", warning: "text-warning bg-warning/10", info: "text-info bg-info/10" };
  return (
    <div className="p-3.5 rounded-xl border border-border/20 bg-surface/30 hover:border-primary/20 transition-all cursor-pointer group">
      <div className="flex items-center gap-2.5 mb-1.5"><div className={cn("p-1.5 rounded-lg", colors[type])}><Icon className="w-3.5 h-3.5" /></div><h4 className="text-sm font-semibold text-text-main">{title}</h4></div>
      <p className="text-[11px] text-text-faint leading-relaxed group-hover:text-text-muted transition-colors">{description}</p>
    </div>
  );
}
