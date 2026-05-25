import { getEmployees } from "@/app/actions";
import HRClient from "./hr-client";

export default async function HRPage() {
  const employees = await getEmployees();
  
  return <HRClient initialEmployees={employees} />;
}
