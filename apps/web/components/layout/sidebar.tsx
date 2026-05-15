"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Truck,
  Settings,
  Briefcase,
  LogOut,
  Building2,
  BarChart3,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navSections = [
  {
    label: "CORE",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Analytics", icon: BarChart3, href: "/analytics" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "HR & Payroll", icon: Users, href: "/hr" },
      { label: "Finance", icon: CreditCard, href: "/finance" },
      { label: "Supply Chain", icon: Truck, href: "/supply-chain" },
      { label: "Projects", icon: Briefcase, href: "/projects" },
    ],
  },
  {
    label: "SYSTEM",
    items: [{ label: "Settings", icon: Settings, href: "/settings" }],
  },
];

export default function Sidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-[260px] h-screen flex flex-col",
        "bg-surface-0/80 backdrop-blur-xl",
        "border-r border-border/30",
        "transition-all duration-300",
        className
      )}
    >
      {/* ─── Logo ─── */}
      <div className="p-5 flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-vivid to-cyan flex items-center justify-center shadow-lg shadow-primary/20">
            <Building2 className="text-slate-950 w-5 h-5" />
          </div>
          {/* Subtle glow behind logo */}
          <div className="absolute inset-0 w-9 h-9 rounded-xl bg-primary/20 blur-lg -z-10" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-text-main">
            AMX
          </span>
          <span className="font-bold text-base tracking-tight text-gradient-primary">
            -ERP
          </span>
        </div>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-3 overflow-y-auto scrollbar-hide space-y-5 mt-2">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-bold text-text-faint uppercase tracking-[0.15em]">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "text-primary bg-primary/[0.08]"
                        : "text-text-muted hover:text-text-main hover:bg-card/60"
                    )}
                  >
                    {/* Active edge indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-gradient-to-b from-primary to-cyan"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}

                    <item.icon
                      className={cn(
                        "w-[18px] h-[18px] transition-all duration-200 shrink-0",
                        isActive
                          ? "text-primary drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                          : "text-text-faint group-hover:text-text-muted"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── User Footer ─── */}
      <div className="p-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 group hover:border-border/60 transition-all duration-200">
          {/* Avatar with status ring */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-rose flex items-center justify-center text-white text-xs font-bold shadow-sm">
              AD
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-surface-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-main truncate">
              Admin User
            </p>
            <p className="text-[10px] text-text-faint truncate">
              Acme Corp
            </p>
          </div>
          <button className="text-text-faint hover:text-danger transition-colors p-1 rounded-lg hover:bg-danger/10">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
