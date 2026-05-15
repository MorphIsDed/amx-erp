"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from "recharts";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Sparkles, 
  BrainCircuit, 
  AlertCircle,
  ArrowUpRight,
  Target,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const data = [
  { name: "Jan", actual: 4000, predicted: 4100 },
  { name: "Feb", actual: 3000, predicted: 3200 },
  { name: "Mar", actual: 2000, predicted: 2150 },
  { name: "Apr", actual: 2780, predicted: 2900 },
  { name: "May", actual: 1890, predicted: 2100 },
  { name: "Jun", actual: 2390, predicted: 2500 },
  { name: "Jul", actual: null, predicted: 3100 },
  { name: "Aug", actual: null, predicted: 3400 },
  { name: "Sep", actual: null, predicted: 3900 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* AI HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-card to-card border border-primary/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <BrainCircuit className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight flex items-center gap-2">
              AI Business Intelligence
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">v2.4 PRO</span>
            </h1>
            <p className="text-text-muted mt-1 max-w-md text-sm leading-relaxed">
              Predictive modeling active. Analyzing historical patterns to forecast revenue, demand, and risk.
            </p>
          </div>
        </div>
        <div className="relative z-10 flex gap-4">
          <Card variant="glass" className="p-4 border-emerald-500/30">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Confidence Score</p>
            <p className="text-2xl font-bold text-primary mt-1">94.2%</p>
          </Card>
          <Card variant="glass" className="p-4 border-blue-500/30">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Anomalies Detected</p>
            <p className="text-2xl font-bold text-blue-500 mt-1">0</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE FORECAST CHART */}
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Forecast</CardTitle>
              <p className="text-xs text-text-muted mt-1">Prophetic projection based on 24-month variance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-text-muted uppercase">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary/30 border border-dashed border-primary" />
                <span className="text-[10px] font-bold text-text-muted uppercase">AI Prediction</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0c10', 
                    borderColor: '#10b981', 
                    borderRadius: '12px',
                    fontSize: '12px'
                  }} 
                  itemStyle={{ color: '#10b981' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#10b981" 
                  strokeDasharray="5 5" 
                  strokeOpacity={0.4}
                  fill="transparent" 
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorActual)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI INSIGHTS FEED */}
        <div className="space-y-6">
          <Card variant="default">
            <CardHeader className="flex flex-row items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InsightItem 
                icon={TrendingUp}
                title="Revenue Surge"
                description="AI predicts an 18% growth in Q3 due to seasonal patterns in existing invoices."
                type="positive"
              />
              <InsightItem 
                icon={Zap}
                title="Supply Chain Risk"
                description="3 core SKUs are predicted to go out of stock within 14 days based on current burn rate."
                type="warning"
              />
              <InsightItem 
                icon={Target}
                title="Cost Optimization"
                description="Identified 12.4% potential savings by consolidating vendor orders from Mumbai depot."
                type="info"
              />
            </CardContent>
          </Card>

          <Card variant="default" className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary text-slate-950">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-text-main">AI Recommendation</h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                Based on your historical performance, we recommend increasing stock for **Logitech MX Master 3** by 25% before June 15 to meet projected demand.
              </p>
              <Button size="sm" className="w-full">
                Generate PO Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InsightItem({ icon: Icon, title, description, type }: any) {
  const colors: any = {
    positive: "text-emerald-500 bg-emerald-500/10",
    warning: "text-amber-500 bg-amber-500/10",
    info: "text-blue-500 bg-blue-500/10",
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 hover:border-primary/30 transition-all cursor-pointer group">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("p-1.5 rounded-lg", colors[type])}>
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-bold text-text-main">{title}</h4>
      </div>
      <p className="text-[11px] text-text-muted leading-relaxed group-hover:text-text-main transition-colors">
        {description}
      </p>
    </div>
  );
}
