export interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: "Paid" | "Pending";
}