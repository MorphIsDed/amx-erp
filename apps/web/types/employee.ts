export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: EmployeeStatus;
  hireDate: string | Date;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  baseSalary: number;
  allowances: number;
  deductions: number;
  createdAt: string;
  updatedAt: string;
}

export function getEmployeeFullName(employee: Pick<Employee, 'firstName' | 'lastName'>): string {
  return `${employee.firstName} ${employee.lastName}`.trim();
}