import Table from "@/components/ui/table";

const inventory = [
  { id: 1, item: "Laptop", stock: 20, status: "Available" },
  { id: 2, item: "Mouse", stock: 5, status: "Low Stock" },
];

export default function SupplyChainPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Supply Chain</h1>

      <button className="bg-blue-500 px-4 py-2 text-white rounded">
        Add Item
      </button>

      <Table headers={["Item", "Stock", "Status"]}>
        {inventory.map((item) => (
          <tr key={item.id} className="border-t">
            <td className="p-2">{item.item}</td>
            <td className="p-2">{item.stock}</td>
            <td className="p-2">{item.status}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}