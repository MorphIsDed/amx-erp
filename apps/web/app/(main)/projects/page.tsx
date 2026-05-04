"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/store";

export default function ProjectsPage() {
  const { tasks, addTask } = useProjectStore();
  const [title, setTitle] = useState("");

  const createTask = () => {
    addTask({
      id: Date.now().toString(),
      title,
      status: "Todo",
    });
    setTitle("");
  };

  const columns = ["Todo", "In Progress", "Done"] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Projects</h1>

      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task"
          className="border p-2"
        />
        <button onClick={createTask} className="bg-blue-500 px-3 text-white">
          Add
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col} className="border p-3 rounded">
            <h2 className="font-semibold mb-2">{col}</h2>

            {tasks
              .filter((t) => t.status === col)
              .map((t) => (
                <div key={t.id} className="border p-2 mb-2 rounded">
                  {t.title}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}