"use client";

import Link from "next/link";
import {
  Home,
  Users,
  BarChart3,
  Package,
  Settings,
  Briefcase,
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#020617] border-r border-[var(--border)] p-5 flex flex-col">
      <h1 className="text-lg font-semibold mb-8">AMX ERP</h1>

      <nav className="flex flex-col gap-2">
        <NavItem icon={<Home size={18} />} label="Dashboard" href="/dashboard" />
        <NavItem icon={<Users size={18} />} label="HR" href="/hr" />
        <NavItem icon={<Package size={18} />} label="Supply Chain" href="/supply-chain" />
        <NavItem icon={<BarChart3 size={18} />} label="Analytics" href="/analytics" />
        <NavItem icon={<Briefcase size={18} />} label="Projects" href="/projects" />
        <NavItem icon={<Settings size={18} />} label="Settings" href="/settings" />
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}