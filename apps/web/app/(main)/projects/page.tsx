"use client";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>

      <div className="grid grid-cols-3 gap-4">
        {["Todo", "In Progress", "Done"].map((col) => (
          <div
            key={col}
            className="bg-[#111827] border border-gray-800 p-4 rounded-xl"
          >
            <h2 className="mb-3 font-semibold">{col}</h2>
            <p className="text-gray-400">No tasks yet</p>
          </div>
        ))}
      </div>
    </div>
  );
}