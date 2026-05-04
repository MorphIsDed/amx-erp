import Table from "@/components/ui/table";

const tasks = [
  { id: 1, name: "Build API", status: "In Progress" },
  { id: 2, name: "Design UI", status: "Completed" },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Projects</h1>

      <button className="bg-blue-500 px-4 py-2 text-white rounded">
        Add Task
      </button>

      <Table headers={["Task", "Status"]}>
        {tasks.map((task) => (
          <tr key={task.id} className="border-t">
            <td className="p-2">{task.name}</td>
            <td className="p-2">{task.status}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}