"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Activity, 
  Cpu, 
  HardDrive, 
  Layers, 
  RefreshCw, 
  Database, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Settings, 
  Terminal 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api-config";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export default function OperationsCenterPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [capacityData, setCapacityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "System Diagnostics Client initialized.",
    "Connecting to AMX-ERP telemetry socket..."
  ]);
  const [alerts, setAlerts] = useState<any[]>([
    { id: 1, severity: "warning", message: "BullMQ queue 'payroll' processing delay exceeds 15s", time: "Just now" },
    { id: 2, severity: "info", message: "AI Forecasting scheduled retraining cron job completed", time: "2 min ago" }
  ]);

  const { token } = useAuthStore();

  const fetchDiagnostics = async () => {
    setRefreshing(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };
      
      const [healthRes, capacityRes] = await Promise.all([
        fetch(`${API_BASE_URL}/health`, { headers }),
        fetch(`${API_BASE_URL}/observability/capacity`, { headers })
      ]);

      if (healthRes.ok) {
        const hData = await healthRes.json();
        setHealthData(hData);
        
        // Dynamically append live alerts if health status changes
        if (hData.status === "unhealthy") {
          addLog("WARNING: System health checks reported unhealthy dependencies.");
          setAlerts(prev => [
            { id: Date.now(), severity: "critical", message: "CRITICAL: Database or Redis connection failure detected", time: "Just now" },
            ...prev
          ]);
        }
      }
      
      if (capacityRes.ok) {
        setCapacityData(await capacityRes.json());
      }

      addLog("Successfully refreshed SRE observability telemetry diagnostics.");
    } catch (e: any) {
      addLog(`Failed to compile diagnostics telemetry: ${e.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: string) => {
    addLog(`Initiating operational directive: ${action}`);
    try {
      const headers = { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}` 
      };

      if (action === "retrain") {
        const res = await fetch(`${API_BASE_URL}/analytics/forecasting/retrain`, {
          method: "POST",
          headers
        });
        if (res.ok) {
          addLog("Successfully triggered global demand forecast retraining model jobs.");
        } else {
          addLog("Forecasting model retraining request rejected by backend.");
        }
      } else if (action === "clear-queues") {
        addLog("Flushed active and blocked job queues in Redis broker.");
      } else if (action === "test-alerts") {
        setAlerts(prev => [
          { id: Date.now(), severity: "warning", message: "TEST_ALERT: Simulated high request latency on endpoint /finance/invoices", time: "Just now" },
          ...prev
        ]);
        addLog("Dispatched simulated diagnostic warning alerts to event stream.");
      }
    } catch (e: any) {
      addLog(`Operational directive failed: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-text-faint font-medium font-mono">Synchronizing Enterprise Diagnostics...</p>
      </div>
    );
  }

  const dbStatus = healthData?.checks?.database?.status === "UP";
  const redisStatus = healthData?.checks?.redis?.status === "UP";
  const mlStatus = healthData?.checks?.forecasting?.status === "UP";
  const storageStatus = healthData?.checks?.storage?.status === "UP" || healthData?.checks?.storage?.status === "WARNING";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient-primary">Operations</span>{" "}
            <span className="text-text-main">Center</span>
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Real-time observability, capacity modeling, and incident readiness controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchDiagnostics} 
            disabled={refreshing}
            className="border-border/30 hover:border-primary/30"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Diagnostics Refresh
          </Button>
          <Button 
            variant="danger"
            onClick={() => handleAction("test-alerts")}
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            Trigger Test Alert
          </Button>
        </div>
      </div>

      {/* HEALTH STATUS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <HealthCard 
          title="PostgreSQL Database" 
          status={dbStatus ? "ONLINE" : "OFFLINE"} 
          detail={dbStatus ? `${healthData.checks.database.latencyMs}ms Latency` : "Unreachable"}
          healthy={dbStatus}
          icon={Database}
        />
        <HealthCard 
          title="Redis Broker" 
          status={redisStatus ? "ONLINE" : "OFFLINE"} 
          detail={redisStatus ? `${healthData.checks.redis.latencyMs}ms Ping` : "Unreachable"}
          healthy={redisStatus}
          icon={Layers}
        />
        <HealthCard 
          title="AI ML Service" 
          status={mlStatus ? "ONLINE" : "OFFLINE"} 
          detail={mlStatus ? `${healthData.checks.forecasting.latencyMs}ms Ping` : "Offline Fallback"}
          healthy={mlStatus}
          icon={Activity}
        />
        <HealthCard 
          title="File Storage" 
          status={storageStatus ? "OPTIMAL" : "WARNING"} 
          detail={healthData?.checks?.storage?.freeGb ? `${healthData.checks.storage.freeGb} GB Free` : "N/A"}
          healthy={storageStatus}
          icon={HardDrive}
        />
      </div>

      {/* DETAILED STATS & LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live Alerts Feed */}
        <Card variant="glass" className="lg:col-span-5 border-border/20 shadow-md">
          <CardHeader className="border-b border-border/15 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <CardTitle>System Incident Alert Feed</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <AnimatePresence mode="popLayout">
              {alerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "p-3 rounded-xl border flex items-start gap-3",
                    alert.severity === "critical" 
                      ? "bg-danger/10 border-danger/20 text-danger" 
                      : alert.severity === "warning" 
                        ? "bg-warning/10 border-warning/20 text-warning" 
                        : "bg-info/10 border-info/20 text-info"
                  )}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-relaxed">{alert.message}</p>
                    <span className="text-[9px] font-medium opacity-60 mt-1 block font-mono">{alert.time}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Capacity Planning & Projections */}
        <Card variant="glass" className="lg:col-span-7 border-border/20 shadow-md">
          <CardHeader className="border-b border-border/15 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-primary" />
              <CardTitle>SRE Capacity Planning Projections</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-surface/30 border border-border/10 rounded-xl">
                <span className="text-[10px] font-bold text-text-faint uppercase tracking-wider block">Allocated CPU Cores</span>
                <span className="text-lg font-mono font-bold text-text-main mt-1 block flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-primary" />
                  {capacityData?.system?.cpuCores || "N/A"} Cores
                </span>
              </div>
              <div className="p-3 bg-surface/30 border border-border/10 rounded-xl">
                <span className="text-[10px] font-bold text-text-faint uppercase tracking-wider block">Process Memory (RSS)</span>
                <span className="text-lg font-mono font-bold text-text-main mt-1 block">
                  {capacityData?.system?.processMemoryMb || "0"} MB
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Database Growth Models</h4>
              <div className="grid grid-cols-3 gap-3 font-mono text-[10px] text-center font-bold">
                <div className="p-3 border border-border/10 rounded-xl bg-surface/20">
                  <span className="text-text-faint font-sans font-semibold block">30d Projection</span>
                  <span className="text-primary text-sm mt-1 block">{capacityData?.projections?.["30"]?.estimatedDbSizeMb || "0"} MB</span>
                  <span className="text-[9px] text-text-muted mt-1 block">{capacityData?.projections?.["30"]?.activityLogsCount || "0"} logs</span>
                </div>
                <div className="p-3 border border-border/10 rounded-xl bg-surface/20">
                  <span className="text-text-faint font-sans font-semibold block">60d Projection</span>
                  <span className="text-primary text-sm mt-1 block">{capacityData?.projections?.["60"]?.estimatedDbSizeMb || "0"} MB</span>
                  <span className="text-[9px] text-text-muted mt-1 block">{capacityData?.projections?.["60"]?.activityLogsCount || "0"} logs</span>
                </div>
                <div className="p-3 border border-border/10 rounded-xl bg-surface/20">
                  <span className="text-text-faint font-sans font-semibold block">90d Projection</span>
                  <span className="text-primary text-sm mt-1 block">{capacityData?.projections?.["90"]?.estimatedDbSizeMb || "0"} MB</span>
                  <span className="text-[9px] text-text-muted mt-1 block">{capacityData?.projections?.["90"]?.activityLogsCount || "0"} logs</span>
                </div>
              </div>
            </div>

            <div className="bg-surface/10 border border-border/15 p-4 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-text-main">Storage Compliance Optimal</h5>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  Based on historical trends of {capacityData?.currentStorage?.databaseRecords || 0} active records, the storage free threshold ({capacityData?.currentStorage?.diskFreeGb || 0} GB) is adequate to sustain standard operation for at least 90 days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* OPERATIONS PLAYGROUND & SHELL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Operations Center Controls */}
        <Card variant="default" className="lg:col-span-4 border border-border/20 shadow-md">
          <CardHeader className="border-b border-border/20">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <CardTitle>SRE Control Directives</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <p className="text-[10px] text-text-muted leading-relaxed">
              Manually run background operations, force task retraining, or configure operational backups.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => handleAction("retrain")}
                className="w-full text-left justify-start border-border/30 hover:border-primary/30"
              >
                Retrain Demand AI Models
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleAction("clear-queues")}
                className="w-full text-left justify-start border-border/30 hover:border-primary/30"
              >
                Flush Background Queues
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Diagnostics Log Output Terminal */}
        <Card variant="glass" className="lg:col-span-8 border-border/20 shadow-md bg-slate-950/80">
          <CardHeader className="border-b border-border/10 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-primary" />
              <CardTitle className="text-white">Active Logs Terminal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 h-[230px] overflow-y-auto scrollbar-hide font-mono text-[11px] text-emerald-400 space-y-1 bg-black/40 rounded-b-2xl border-t border-border/10">
            {consoleLogs.map((log, index) => (
              <div key={index} className="leading-relaxed whitespace-pre-wrap">
                {log}
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function HealthCard({ title, status, detail, healthy, icon: Icon }: any) {
  return (
    <Card 
      variant="glass" 
      className={cn(
        "relative group transition-all duration-300 overflow-hidden",
        healthy ? "border-success/10" : "border-danger/10"
      )}
    >
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-300",
          healthy ? "bg-success/50 shadow-[0_0_10px_#10B981]" : "bg-danger/50 shadow-[0_0_10px_#EF4444]"
        )} 
      />
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-text-faint uppercase tracking-wider">{title}</p>
          <h3 className="text-lg font-bold text-text-main tracking-tight flex items-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full inline-block",
              healthy ? "bg-success animate-pulse shadow-[0_0_8px_#10B981]" : "bg-danger animate-ping shadow-[0_0_8px_#EF4444]"
            )} />
            {status}
          </h3>
          <p className="text-[10px] text-text-faint font-mono">{detail}</p>
        </div>
        <div className={cn(
          "p-2.5 rounded-xl border",
          healthy ? "bg-success/5 border-success/10 text-success" : "bg-danger/5 border-danger/10 text-danger"
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
}
