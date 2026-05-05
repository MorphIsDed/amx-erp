"use client";

import Card from "@/components/ui/stat-card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card label="Revenue" value="₹120K" />
        <Card label="Users" value="3200" />
        <Card label="Growth" value="+12%" />
      </div>

      <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl">
        Charts will appear here
      </div>
    </div>
  );
}