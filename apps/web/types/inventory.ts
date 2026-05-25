export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  status?: "Available" | "Low" | "Out";
  category: string;
}