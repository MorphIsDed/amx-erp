"use client";

import { useState } from "react";
import Card from "@/components/ui/stat-card";

export default function HRPage() {
  const [tab, setTab] = useState("employees");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">HR</h1>
        <p className="text-gray-400 text-sm">
          Manage employees and attendance
        </p>
      </div>

      <div className="flex gap-4 border-b border-gray-800 pb-2">
        {["employees", "attendance", "leaves"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-1 ${
              tab === t
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card label="Employees" value="1200" />
        <Card label="Present" value="1100" />
        <Card label="On Leave" value="100" />
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
        HR content UI ready
      </div>
    </div>
  );
}