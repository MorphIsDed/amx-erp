"use client";

import Sidebar from "@/components/layout/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-[#0b0f19] text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}