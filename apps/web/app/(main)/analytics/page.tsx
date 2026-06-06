"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Sparkles, 
  BrainCircuit, 
  Zap, 
  PieChart, 
  Activity,
  ShieldCheck,
  Cpu,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useList } from "@/hooks/use-crud";
import { Product } from "@/types/product";
import { ApiClient } from "@/services/api-client";

const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item: any = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

export default function AnalyticsPage() {
  const [activeChart, setActiveChart] = useState<"forecast" | "departments" | "ml" | "webhooks">("forecast");
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [training, setTraining] = useState(false);
  const [trainingSuccess, setTrainingSuccess] = useState("");

  // 1. Fetch real products list to populate SKU selector
  const { data: productsRes } = useList<Product>('inventory/products');
  const products = productsRes?.data || [];

  // Set default selected SKU when products load
  useEffect(() => {
    if (products.length > 0 && !selectedSku) {
      setSelectedSku(products[0].sku);
    }
  }, [products, selectedSku]);

  // 2. Fetch real ML Summary / Health
  const { data: mlSummary, isLoading: isMlLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['forecastingSummary'],
    queryFn: async () => {
      const res = await ApiClient.get<any>('/forecasting/summary');
      return res?.data || res;
    },
    initialData: {
      totalProducts: 0,
      totalTrainedModels: 0,
      averageMape: 5.0,
      averageRmse: 2.0,
      accuracyScore: 95.0,
      mlServiceStatus: 'OFFLINE_FALLBACK'
    }
  });

  // 3. Fetch real SKU Forecast
  const { data: skuForecast, isLoading: isSkuLoading } = useQuery({
    queryKey: ['skuForecast', selectedSku],
    queryFn: async () => {
      const res = await ApiClient.get<any>(`/forecasting/sku/${selectedSku}`);
      return res?.data || res;
    },
    enabled: !!selectedSku,
    initialData: {
      sku: selectedSku,
      productName: "Loading product...",
      forecastType: "regression",
      predictions: []
    }
  });

  // 4. Fetch real Revenue Forecast
  const { data: revenueForecast = [], isLoading: isRevenueLoading } = useQuery({
    queryKey: ['revenueForecast'],
    queryFn: async () => {
      const res = await ApiClient.get<any>('/analytics/revenue-forecast');
      return res?.data || res || [];
    }
  });

  // 5. Fetch real HR Charts for workforce distribution
  const { data: hrCharts } = useQuery({
    queryKey: ['hrCharts'],
    queryFn: async () => {
      const res = await ApiClient.get<any>('/analytics/hr-charts');
      return res?.data || res;
    },
    initialData: {
      employeeGrowth: [],
      departmentDistribution: [],
      leaveStatistics: { paid: 0, unpaid: 0 }
    }
  });

  // 6. Fetch real Top Demand products
  const { data: topDemand = [] } = useQuery({
    queryKey: ['topDemand'],
    queryFn: async () => {
      const res = await ApiClient.get<any>('/forecasting/top-demand');
      return res?.data || res || [];
    }
  });

  // Model training handler
  const handleTrainModels = async () => {
    setTraining(true);
    setTrainingSuccess("");
    try {
      await ApiClient.post('/forecasting/train', {});
      setTrainingSuccess("All SKU models successfully queued & retrained on FastAPI ML server!");
      setTimeout(() => setTrainingSuccess(""), 5000);
      refetchSummary();
    } catch (err: any) {
      console.error("Retraining error:", err);
    } finally {
      setTraining(false);
    }
  };

  // Map revenue forecast data for Recharts AreaChart
  const rawChartData = revenueForecast.map((item: any) => ({
    name: item.month.includes("Forecast") ? item.month : new Date(item.month + "-02").toLocaleDateString('en-US', { month: 'short' }),
    actual: item.actual,
    predicted: item.predicted,
    // Add estimated treasury outflow (25% of inflow) for dual visualization
    expense: Math.round(item.predicted * 0.25)
  }));

  // Map workforce distribution data
  const departmentData = hrCharts.departmentDistribution.map((d: any) => ({
    name: d.department,
    Headcount: d.count,
    Payroll: d.count * 95000,
  }));

  const mockWebhookDeliverability = [
    { name: "Invoice Paid", success: 42, failed: 0, delayMs: 45 },
    { name: "Invoice Created", success: 58, failed: 1, delayMs: 62 },
    { name: "Leave Approved", success: 18, failed: 0, delayMs: 38 },
    { name: "Task Completed", success: 122, failed: 2, delayMs: 50 },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {trainingSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 bg-primary/[0.08] border border-primary/30 rounded-2xl flex items-center gap-3 text-sm text-primary font-medium shadow-xl backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-slate-950 font-bold">✓</div>
            <div className="flex-1">{trainingSuccess}</div>
            <button onClick={() => setTrainingSuccess("")} className="text-primary hover:opacity-85 text-xs font-semibold">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI BUSINESS INTELLIGENCE LEADER */}
      <motion.div variants={item} className="relative p-8 rounded-2xl border border-primary/15 overflow-hidden bg-card/45 backdrop-blur-md shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/[0.05] blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/[0.03] blur-[100px] rounded-full -ml-10 -mb-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex flex-wrap items-center gap-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>{" "}
                <span className="text-neutral-100">Enterprise Intelligence</span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border animate-pulse",
                  mlSummary.mlServiceStatus === 'ONLINE' 
                    ? "bg-success/10 text-success border-success/20" 
                    : "bg-warning/10 text-warning border-warning/20"
                )}>
                  {mlSummary.mlServiceStatus}
                </span>
              </h1>
              <p className="text-neutral-400 mt-2 max-w-md text-sm">
                Live predictive modeling of treasury cash flow, supply chain demand forecasting, and real-time outbound integrations.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-sm min-w-[120px]">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Predictive Score</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{isMlLoading ? "..." : `${mlSummary.accuracyScore}%`}</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-sm min-w-[120px]">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Active Models</p>
              <p className="text-2xl font-bold text-violet-400 mt-1 font-mono">
                {isMlLoading ? "..." : `${mlSummary.totalTrainedModels}/${mlSummary.totalProducts}`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CORE CHARTS SECTION */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <Card className="lg:col-span-2 overflow-hidden border-neutral-800/80 bg-neutral-900/20 backdrop-blur-md shadow-xl">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-neutral-800/60 bg-neutral-900/30">
            <div>
              <CardTitle className="text-white font-bold">Enterprise Intelligence Suite</CardTitle>
              <p className="text-xs text-neutral-400 mt-1">Select views below to inspect treasury forecasts, SKU demand trends, and webhook deliverability.</p>
            </div>
            
            {/* Chart type Toggles */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
              <button 
                onClick={() => setActiveChart("forecast")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  activeChart === "forecast" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Treasury
              </button>
              <button 
                onClick={() => setActiveChart("ml")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  activeChart === "ml" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                <Cpu className="w-3.5 h-3.5" />
                SKU Demand
              </button>
              <button 
                onClick={() => setActiveChart("webhooks")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  activeChart === "webhooks" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                <Activity className="w-3.5 h-3.5" />
                Webhooks
              </button>
              <button 
                onClick={() => setActiveChart("departments")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  activeChart === "departments" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                <PieChart className="w-3.5 h-3.5" />
                Workforce
              </button>
            </div>
          </CardHeader>

          <CardContent className="h-[380px] w-full pt-6">
            <AnimatePresence mode="wait">
              {activeChart === "forecast" && (
                <motion.div 
                  key="forecast"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full h-full"
                >
                  {isRevenueLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-text-faint">
                      <Loader2 className="w-7 h-7 animate-spin text-primary" />
                      <span>Projecting cash ledger...</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={rawChartData}>
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f87171" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 10 }} dy={10} />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: "#737373", fontSize: 10 }} 
                          tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                        />
                        <Tooltip 
                          formatter={(val: any) => [`₹${parseInt(val).toLocaleString()}`, ""]}
                          contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "11px", color: "#f5f5f5" }} 
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                        <Area type="monotone" name="Projected Cash Inflow" dataKey="predicted" stroke="#34d399" strokeDasharray="4 4" strokeOpacity={0.5} fill="transparent" />
                        <Area type="monotone" name="Actual Ledger Inflow" dataKey="actual" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                        <Area type="monotone" name="Treasury Outflow (Est)" dataKey="expense" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>
              )}

              {activeChart === "ml" && (
                <motion.div 
                  key="ml"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full h-full flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center mb-4 px-2">
                    <div className="flex gap-2 max-w-[60%] overflow-x-auto">
                      {products.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedSku(p.sku)}
                          className={cn(
                            "px-2.5 py-1 rounded text-[10px] font-bold border cursor-pointer transition-colors whitespace-nowrap",
                            selectedSku === p.sku 
                              ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200" 
                              : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                          )}
                        >
                          {p.sku}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                      Model Type: {skuForecast.forecastType}
                    </span>
                  </div>
                  
                  <div className="h-[280px]">
                    {isSkuLoading ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-text-faint">
                        <Loader2 className="w-7 h-7 animate-spin text-primary" />
                        <span>Querying FastAPI model prediction...</span>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={skuForecast.predictions}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 8 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 10 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "11px", color: "#f5f5f5" }} 
                          />
                          <Line type="monotone" name="Forecasted Demand Quantity" dataKey="quantity" stroke="#818cf8" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </motion.div>
              )}

              {activeChart === "webhooks" && (
                <motion.div 
                  key="webhooks"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockWebhookDeliverability}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "11px", color: "#f5f5f5" }} 
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                      <Bar name="Successful Dispatches" dataKey="success" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar name="Failed Retries" dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {activeChart === "departments" && (
                <motion.div 
                  key="departments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "11px", color: "#f5f5f5" }} 
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                      <Bar name="Staff Count" dataKey="Headcount" fill="#60a5fa" radius={[4, 4, 0, 0]}>
                        {departmentData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#60a5fa" : "#34d399"} />
                        ))}
                      </Bar>
                      <Bar name="Est. Monthly Payroll (₹)" dataKey="Payroll" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* RIGHT SIDE: AI INSIGHTS & ACTIONS */}
        <div className="space-y-6">
          <Card className="border-neutral-800 bg-neutral-900/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-neutral-800/80 bg-neutral-900/20">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <CardTitle className="text-white text-base font-semibold">Interactive Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <InsightItem 
                icon={TrendingUp} 
                title="AI Demand Forecast" 
                description={
                  topDemand.length > 0 
                    ? `Forecast predicts high demand volume for "${topDemand[0].name}" (+${topDemand[0].forecastedVolume30d} units).`
                    : "No high demand spikes forecasted for this catalog cycle."
                } 
                type="positive" 
              />
              <InsightItem 
                icon={ShieldCheck} 
                title="Integrations Signature" 
                description="Webhook payload dispatches secured with HMAC-SHA256 headers." 
                type="info" 
              />
              <InsightItem 
                icon={Zap} 
                title="Low Stock Advisory" 
                description={`${products.filter((p: any) => p.stock <= p.reorderLevel).length} SKUs are below safety margins.`} 
                type="warning" 
              />
            </CardContent>
          </Card>

          <Card className="border-indigo-500/10 bg-indigo-500/[0.01] backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/10">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Demand Intelligence Actions</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Deploy linear & seasonal regression modeling to analyze historical SKU outbound cycles, improving inventory replenishment timelines.
              </p>
              <button
                onClick={handleTrainModels}
                disabled={training}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-indigo-500/30 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-xs font-bold text-white cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {training ? "Training ML models..." : "Trigger Model Retraining"}
              </button>
            </CardContent>
          </Card>
        </div>

      </motion.div>

    </motion.div>
  );
}

function InsightItem({ icon: Icon, title, description, type }: any) {
  const colors: Record<string, string> = { 
    positive: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", 
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20", 
    info: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" 
  };
  
  return (
    <div className="p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-900/30 hover:border-indigo-500/20 transition-all cursor-pointer group">
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className={cn("p-1.5 rounded-lg border", colors[type])}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-sm font-semibold text-neutral-200">{title}</h4>
      </div>
      <p className="text-[11px] text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
        {description}
      </p>
    </div>
  );
}
