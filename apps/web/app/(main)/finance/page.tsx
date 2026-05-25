import { getTransactions } from "@/app/actions";
import FinanceClient from "./finance-client";

export default async function FinancePage() {
  const transactions = await getTransactions();
  
  return <FinanceClient initialTransactions={transactions} />;
}
