import { getPurchaseOrders } from "@/app/actions";
import POClient from "./po-client";

export default async function POPage() {
  const purchaseOrders = await getPurchaseOrders();
  
  return <POClient initialPOs={purchaseOrders} />;
}
