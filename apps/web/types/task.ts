export interface Task {
  id: string;
  title: string;
  description: string;
  status: "Todo" | "In Progress" | "Done";
}