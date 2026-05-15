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
  ChevronRight,
  LogOut,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "HR & Payroll", icon: Users, href: "/hr" },
  { label: "Finance", icon: CreditCard, href: "/finance" },
  { label: "Supply Chain", icon: Truck, href: "/supply-chain" },
  { label: "Projects", icon: Briefcase, href: "/projects" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar({ onNavigate, className }: { onNavigate?: () => void, className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "w-64 h-screen border-r border-border bg-surface flex flex-col transition-all duration-300",
      className
    )}>
      {/* LOGO AREA */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Building2 className="text-slate-950 w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight text-text-main">AMX-ERP</span>
      </div>

      {/* NAV ITEMS */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-text-muted hover:bg-card hover:text-text-main"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-primary" : "text-text-muted group-hover:text-text-main"
                )} />
                {item.label}
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* USER FOOTER */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-card border border-border/50">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-main truncate">Admin User</p>
            <p className="text-[10px] text-text-muted truncate">Acme Corp</p>
          </div>
          <button className="text-text-muted hover:text-danger transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
