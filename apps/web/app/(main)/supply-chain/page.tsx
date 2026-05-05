"use client";

import Card from "@/components/ui/stat-card";

export default function SupplyChainPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Supply Chain</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card label="Total Items" value="320" />
        <Card label="Low Stock" value="12" />
        <Card label="Out of Stock" value="4" />
      </div>

      <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl">
        Inventory dashboard ready
      </div>
    </div>
  );
}