"use client";

import { Home, Users, BarChart3, Package, Settings } from "lucide-react";
import { ReactNode } from "react";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 p-5 flex flex-col">
      <h1 className="text-lg font-semibold mb-8 tracking-wide text-gray-200">
        AMDOX ERP
      </h1>

      <nav className="flex flex-col gap-2">
        <NavItem active icon={<Home size={18} />} label="Dashboard" />
        <NavItem icon={<Users size={18} />} label="HR" />
        <NavItem icon={<Package size={18} />} label="Supply Chain" />
        <NavItem icon={<BarChart3 size={18} />} label="Analytics" />
        <NavItem icon={<Settings size={18} />} label="Settings" />
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all
      ${active
        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
        : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}