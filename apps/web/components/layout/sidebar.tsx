"use client";
import Link from "next/link";
import { BarChart3, Briefcase, Home, Package, Settings, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <div
        className={`w-64 max-w-[85vw] h-[100dvh] bg-card border-r border-border p-5 flex flex-col ${className ?? ""}`}
      >
        <h1 className="text-lg font-semibold mb-8">AMX ERP</h1>
        <nav className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1">
          <NavItem icon={<Home size={18} />} label="Dashboard" href="/dashboard" onNavigate={onNavigate} />
          <NavItem icon={<Users size={18} />} label="HR" href="/hr" onNavigate={onNavigate} />
          <NavItem icon={<Package size={18} />} label="Supply Chain" href="/supply-chain" onNavigate={onNavigate} />
          <NavItem icon={<BarChart3 size={18} />} label="Analytics" href="/analytics" onNavigate={onNavigate} />
          <NavItem icon={<Briefcase size={18} />} label="Projects" href="/projects" onNavigate={onNavigate} />
          <NavItem icon={<Settings size={18} />} label="Settings" href="/settings" onNavigate={onNavigate} />
        </nav>
      </div>
    </motion.div>
  );
}

function NavItem({
  icon,
  label,
  href,
  onNavigate,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onNavigate?: () => void;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <Link
        href={href}
        onClick={onNavigate}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:bg-card transition"
      >
        {icon}
        <span>{label}</span>
      </Link>
    </motion.div>
  );
}

