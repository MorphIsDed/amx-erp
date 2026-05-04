import Sidebar from "@/components/layout/sidebar";
import RevenueChart from "@/components/layout/charts/revenue-chart";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-8 space-y-6">
        {/* HEADER */}
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <div className="flex items-center gap-4">
            <input
              placeholder="Search..."
              className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm outline-none"
            />
            <div className="w-8 h-8 bg-blue-500 rounded-full" />
          </div>
        </header>

        {/* KPI CARDS */}
        <div className="grid grid-cols-3 gap-6">
          <Card title="Revenue" value="₹2.4M" />
          <Card title="Employees" value="1,240" />
          <Card title="Orders" value="320" />
        </div>

        {/* CHART */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md">
          <h2 className="mb-4 text-gray-300">Revenue Trend</h2>
          <RevenueChart />
        </div>
      </main>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md hover:scale-[1.02] transition">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
}