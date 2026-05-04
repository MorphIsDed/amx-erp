"use client";

export default function Topbar() {
  return (
    <div className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 border-b border-white/10 bg-[#0b0f19]/80 backdrop-blur-xl">
      
      <div className="text-sm text-gray-400">
        Welcome back!
      </div>

      <div className="flex items-center gap-4">
        <input
          placeholder="Search..."
          className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm outline-none focus:border-blue-500"
        />

        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
      </div>
    </div>
  );
}