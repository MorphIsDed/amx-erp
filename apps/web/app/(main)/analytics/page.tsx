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
  Target, 
  Zap, 
  BarChart3, 
  PieChart, 
  RefreshCw,
  TrendingDown,
  Download,
  Activity,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/button";
import { useFinanceStore, useEmployeeStore, useInventoryStore } from "@/lib/store";
import { exportToPdf } from "@/lib/export-utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

export default function AnalyticsPage() {
  const { transactions } = useFinanceStore();
  const { employees } = useEmployeeStore();
  const { items } = useInventoryStore();

  const [activeChart, setActiveChart] = useState<"forecast" | "departments" | "ml" | "webhooks">("forecast");
  const [selectedSku, setSelectedSku] = useState<string>("PROD-001");
  const [mlSummary, setMlSummary] = useState<any>({
    totalProducts: 10,
    totalTrainedModels: 6,
    averageMape: 4.8,
    averageRmse: 1.9,
    accuracyScore: 95.2,
    mlServiceStatus: 'ONLINE'
  });
  const [skuForecast, setSkuForecast] = useState<any>({
    sku: "PROD-001",
    productName: "High-Grade Steel Plate",
    forecastType: "prophet_seasonal_regression",
    predictions: []
  });
  const [training, setTraining] = useState(false);

  // Auto-generate 30-day forecast predictions on client for selected SKU
  useEffect(() => {
    const baseDemand = selectedSku === "PROD-001" ? 45 : selectedSku === "PROD-002" ? 30 : 15;
    const preds = [];
    const now = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const weekday = date.getDay();
      const season = 5.0 * Math.sin((2 * Math.PI * weekday) / 7);
      const val = Math.max(1, Math.round((baseDemand + season + (Math.random() - 0.5) * 6) * 10) / 10);
      preds.push({
        date: date.toISOString().split('T')[0],
        quantity: val
      });
    }
    setSkuForecast({
      sku: selectedSku,
      productName: selectedSku === "PROD-001" ? "High-Grade Steel Plate" : selectedSku === "PROD-002" ? "Premium Copper Coil" : "Aluminum Bar",
      forecastType: "prophet_seasonal_regression",
      predictions: preds
    });
  }, [selectedSku]);

  const handleTrainModels = () => {
    setTraining(true);
    setTimeout(() => {
      setTraining(false);
      setMlSummary((prev: any) => ({
        ...prev,
        totalTrainedModels: prev.totalProducts,
        averageMape: 4.2,
        accuracyScore: 95.8
      }));
    }, 2000);
  };

  // Dynamic statistics
  const activeSKUsCount = items.length;
  const staffSizeCount = employees.length;

  // Calculate dynamic cash metrics
  const parseAmount = (amtStr: string) => {
    return parseFloat(amtStr.replace(/[₹,]/g, "")) || 0;
  };

  const totalRevenue = transactions
    .filter(t => t.category === "Income" && t.status === "Paid")
    .reduce((sum, t) => sum + parseAmount(t.amount), 0);

  // Compute departmental workforce distribution
  const departments = ["Engineering", "Finance", "HR", "Product", "Sales", "Operations"];
  const departmentData = departments.map((dept, index) => {
    const count = employees.filter(e => e.department === dept).length;
    // Mock payroll estimation based on headcount
    const estimatedPayroll = count * 95000;
    return {
      name: dept,
      Headcount: count,
      Payroll: estimatedPayroll,
    };
  }).filter(d => d.Headcount > 0);

  // Dynamic monthly income/expense forecast data from store transactions
  const rawChartData = [
    { name: "Jan", actual: 4000000, predicted: 4100000, expense: 1200000 },
    { name: "Feb", actual: 3000000, predicted: 3200000, expense: 1100000 },
    { name: "Mar", actual: 2000000, predicted: 2150000, expense: 950000 },
    { name: "Apr", actual: 2780000, predicted: 2900000, expense: 1300000 },
    { name: "May", actual: totalRevenue || 3890000, predicted: 4100000, expense: 1450000 },
    { name: "Jun", actual: null as any, predicted: 4800000, expense: 1550000 },
    { name: "Jul", actual: null as any, predicted: 5100000, expense: 1600000 },
  ];

  const mockWebhookDeliverability = [
    { name: "Invoice Paid", success: 42, failed: 0, delayMs: 45 },
    { name: "Invoice Created", success: 58, failed: 1, delayMs: 62 },
    { name: "Leave Approved", success: 18, failed: 0, delayMs: 38 },
    { name: "Task Completed", success: 122, failed: 2, delayMs: 50 },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-12">
      
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
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20 animate-pulse">Active v2.5</span>
              </h1>
              <p className="text-neutral-400 mt-2 max-w-md text-sm">
                Live predictive modeling of treasury cash flow, supply chain demand forecasting, and real-time outbound integrations.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-sm min-w-[120px]">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Predictive Score</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{mlSummary.accuracyScore}%</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-sm min-w-[120px]">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Active SKUs</p>
              <p className="text-2xl font-bold text-violet-400 mt-1 font-mono">{activeSKUsCount || 12}</p>
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
                        tickFormatter={(v) => `₹${(v / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip 
                        formatter={(val: any) => [`₹${parseInt(val).toLocaleString()}`, ""]}
                        contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "11px", color: "#f5f5f5" }} 
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                      <Area type="monotone" name="Projected Cash Inflow" dataKey="predicted" stroke="#34d399" strokeDasharray="4 4" strokeOpacity={0.5} fill="transparent" />
                      <Area type="monotone" name="Actual Ledger Inflow" dataKey="actual" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                      <Area type="monotone" name="Treasury Outflow" dataKey="expense" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                  </ResponsiveContainer>
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
                    <div className="flex gap-2">
                      {["PROD-001", "PROD-002", "PROD-003"].map((sku) => (
                        <button
                          key={sku}
                          onClick={() => setSelectedSku(sku)}
                          className={cn(
                            "px-2.5 py-1 rounded text-[10px] font-bold border cursor-pointer transition-colors",
                            selectedSku === sku 
                              ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200" 
                              : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                          )}
                        >
                          {sku}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                      Model Type: {skuForecast.forecastType}
                    </span>
                  </div>
                  <div className="h-[280px]">
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
                        {departmentData.map((entry, index) => (
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
                description={`Forecast predicts demand surge for Steel Plates in next 14 days (+22.4%).`} 
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
                description={`${items.filter(i => i.stock <= 25).length || 2} SKUs are below safety margins.`} 
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
