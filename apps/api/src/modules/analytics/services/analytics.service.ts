import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  StockMovementType,
  InvoiceStatus,
  PurchaseOrderStatus,
  LeaveStatus,
} from '@repo/db';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardOverview(tenantId: string) {
    const [
      revenueData,
      inventoryData,
      employeeCount,
      recentActivity,
      activeProjectsCount,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { tenantId, status: 'PAID' },
        _sum: { totalAmount: true },
      }),
      this.prisma.product.count({
        where: { tenantId },
      }),
      this.prisma.employee.count({
        where: { tenantId, status: 'ACTIVE' },
      }),
      this.prisma.activityLog.findMany({
        where: { tenantId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      this.prisma.project.count({
        where: { tenantId, deletedAt: null, status: 'ACTIVE' },
      }),
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await this.prisma.invoice.groupBy({
      by: ['issueDate'],
      where: {
        tenantId,
        status: 'PAID',
        issueDate: { gte: sixMonthsAgo },
      },
      _sum: { totalAmount: true },
    });

    return {
      stats: {
        totalRevenue: revenueData._sum.totalAmount || 0,
        activeSourcing: inventoryData,
        headcount: employeeCount,
        growth: 12.5,
        activeProjects: activeProjectsCount,
      },
      revenueTrend: this.formatMonthlyTrend(monthlyRevenue),
      recentActivity,
    };
  }

  // --- Dashboard Summary ---
  async getDashboardSummary(tenantId: string) {
    const [
      paidInvoices,
      allExpenses,
      employeeCount,
      products,
      pendingInvoices,
      pendingPOs,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { tenantId, status: InvoiceStatus.PAID },
        _sum: { totalAmount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { tenantId, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      this.prisma.employee.count({
        where: { tenantId, status: 'ACTIVE' },
      }),
      this.prisma.product.findMany({
        where: { tenantId },
        include: { stockMovements: true },
      }),
      this.prisma.invoice.count({
        where: { tenantId, status: InvoiceStatus.DRAFT },
      }),
      this.prisma.purchaseOrder.count({
        where: { tenantId, status: PurchaseOrderStatus.PENDING_APPROVAL },
      }),
    ]);

    // Calculate total stock value and low stock count
    let inventoryValue = 0;
    let lowStockCount = 0;

    products.forEach((p) => {
      const stockLevel = p.stockMovements.reduce((acc, curr) => {
        const change =
          curr.type === StockMovementType.IN ||
          curr.type === StockMovementType.ADJUSTMENT
            ? curr.quantity
            : -curr.quantity;
        return acc + change;
      }, 0);
      inventoryValue += stockLevel * p.price;
      if (stockLevel <= p.reorderLevel) {
        lowStockCount++;
      }
    });

    return {
      revenue: paidInvoices._sum.totalAmount || 0,
      expenses: allExpenses._sum.amount || 0,
      profit:
        (paidInvoices._sum.totalAmount || 0) - (allExpenses._sum.amount || 0),
      employees: employeeCount,
      inventoryValue,
      lowStockItems: lowStockCount,
      pendingInvoices,
      pendingPurchaseOrders: pendingPOs,
    };
  }

  // --- Finance Charts ---
  async getFinanceCharts(tenantId: string) {
    const [invoices, transactions] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { tenantId, status: InvoiceStatus.PAID },
        select: { totalAmount: true, issueDate: true },
      }),
      this.prisma.transaction.findMany({
        where: { tenantId, type: 'EXPENSE' },
        select: { amount: true, date: true },
      }),
    ]);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const revenueTrend = months.map((m) => ({ month: m, amount: 0 }));
    const expenseTrend = months.map((m) => ({ month: m, amount: 0 }));
    const monthlyProfit = months.map((m) => ({ month: m, profit: 0 }));

    invoices.forEach((inv) => {
      const monthIdx = new Date(inv.issueDate).getMonth();
      revenueTrend[monthIdx].amount += inv.totalAmount;
    });

    transactions.forEach((tx) => {
      const monthIdx = new Date(tx.date).getMonth();
      expenseTrend[monthIdx].amount += tx.amount;
    });

    for (let i = 0; i < 12; i++) {
      monthlyProfit[i].profit = revenueTrend[i].amount - expenseTrend[i].amount;
    }

    return {
      revenueTrend,
      expenseTrend,
      monthlyProfit,
    };
  }

  // --- HR Charts ---
  async getHRCharts(tenantId: string) {
    const [employees, leaves] = await Promise.all([
      this.prisma.employee.findMany({
        where: { tenantId },
        select: { hireDate: true, department: { select: { name: true } } },
      }),
      this.prisma.leave.findMany({
        where: { tenantId, status: LeaveStatus.APPROVED },
        select: { type: true },
      }),
    ]);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const employeeGrowth = months.map((m) => ({ month: m, count: 0 }));

    employees.forEach((emp) => {
      const monthIdx = new Date(emp.hireDate).getMonth();
      employeeGrowth[monthIdx].count++;
    });

    // Accumulate monthly growth
    let current = 0;
    for (let i = 0; i < 12; i++) {
      current += employeeGrowth[i].count;
      employeeGrowth[i].count = current;
    }

    const deptDist: Record<string, number> = {};
    employees.forEach((emp) => {
      const deptName = emp.department?.name || 'Unassigned';
      deptDist[deptName] = (deptDist[deptName] || 0) + 1;
    });

    const leaveDist = {
      paid: leaves.filter((l) => l.type === 'PAID').length,
      unpaid: leaves.filter((l) => l.type === 'UNPAID').length,
    };

    return {
      employeeGrowth,
      departmentDistribution: Object.keys(deptDist).map((name) => ({
        department: name,
        count: deptDist[name],
      })),
      leaveStatistics: leaveDist,
    };
  }

  // --- Inventory Charts ---
  async getInventoryCharts(tenantId: string) {
    const [movements, products, warehouses] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: { tenantId },
        select: { type: true, createdAt: true },
      }),
      this.prisma.product.findMany({
        where: { tenantId },
        include: { stockMovements: true },
      }),
      this.prisma.warehouse.findMany({
        where: { tenantId },
        include: { stockMovements: true },
      }),
    ]);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const stockMovementTrend = months.map((m) => ({
      month: m,
      ins: 0,
      outs: 0,
    }));

    movements.forEach((m) => {
      const monthIdx = new Date(m.createdAt).getMonth();
      if (m.type === StockMovementType.IN) {
        stockMovementTrend[monthIdx].ins++;
      } else if (m.type === StockMovementType.OUT) {
        stockMovementTrend[monthIdx].outs++;
      }
    });

    let lowStock = 0;
    let normalStock = 0;

    products.forEach((p) => {
      const stockLevel = p.stockMovements.reduce((acc, curr) => {
        const change =
          curr.type === StockMovementType.IN ||
          curr.type === StockMovementType.ADJUSTMENT
            ? curr.quantity
            : -curr.quantity;
        return acc + change;
      }, 0);
      if (stockLevel <= p.reorderLevel) {
        lowStock++;
      } else {
        normalStock++;
      }
    });

    const warehouseDist = warehouses.map((w) => {
      const level = w.stockMovements.reduce((acc, curr) => {
        const change =
          curr.type === StockMovementType.IN ||
          curr.type === StockMovementType.ADJUSTMENT
            ? curr.quantity
            : -curr.quantity;
        return acc + change;
      }, 0);
      return { warehouse: w.name, stockLevel: level };
    });

    return {
      stockMovementTrend,
      lowStockDistribution: [
        { category: 'Low Stock Alert', count: lowStock },
        { category: 'Optimal Stock', count: normalStock },
      ],
      warehouseDistribution: warehouseDist,
    };
  }

  private formatMonthlyTrend(data: any[]) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const trend = months.map((m) => ({ month: m, amount: 0 }));

    data.forEach((item) => {
      const monthIndex = new Date(item.issueDate).getMonth();
      trend[monthIndex].amount += item._sum.totalAmount;
    });

    return trend;
  }

  // --- Project Management Analytics ---
  async getProjectsAnalytics(tenantId: string) {
    const [
      projects,
      activeCount,
      completedCount,
      overdueTasksCount,
      upcomingMilestonesCount,
    ] = await Promise.all([
      this.prisma.project.findMany({
        where: { tenantId, deletedAt: null },
      }),
      this.prisma.project.count({
        where: { tenantId, deletedAt: null, status: 'ACTIVE' },
      }),
      this.prisma.project.count({
        where: { tenantId, deletedAt: null, status: 'COMPLETED' },
      }),
      this.prisma.task.count({
        where: {
          tenantId,
          status: { not: 'DONE' },
          dueDate: { lt: new Date() },
        },
      }),
      this.prisma.milestone.count({
        where: {
          tenantId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { gte: new Date() },
        },
      }),
    ]);

    return {
      totalProjects: projects.length,
      activeProjects: activeCount,
      completedProjects: completedCount,
      overdueTasks: overdueTasksCount,
      upcomingMilestones: upcomingMilestonesCount,
      distribution: {
        active: activeCount,
        completed: completedCount,
        onHold: projects.filter((p) => p.status === 'ON_HOLD').length,
        draft: projects.filter((p) => p.status === 'DRAFT').length,
        cancelled: projects.filter((p) => p.status === 'CANCELLED').length,
      },
    };
  }

  async getProjectProgressAnalytics(tenantId: string) {
    const projects = await this.prisma.project.findMany({
      where: { tenantId, deletedAt: null, status: 'ACTIVE' },
      include: {
        tasks: true,
        milestones: true,
      },
    });

    return projects.map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === 'DONE').length;
      const progressPercent =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const totalMilestones = p.milestones.length;
      const completedMilestones = p.milestones.filter(
        (m) => m.status === 'COMPLETED',
      ).length;
      const milestonesProgress =
        totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

      const taskStatusDist = {
        todo: p.tasks.filter((t) => t.status === 'TODO').length,
        inProgress: p.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        review: p.tasks.filter((t) => t.status === 'REVIEW').length,
        blocked: p.tasks.filter((t) => t.status === 'BLOCKED').length,
        done: completedTasks,
      };

      return {
        projectId: p.id,
        name: p.name,
        projectCode: p.projectCode,
        taskProgressPercentage: progressPercent,
        milestoneProgressPercentage: milestonesProgress,
        totalTasks,
        completedTasks,
        taskStatusDistribution: taskStatusDist,
      };
    });
  }

  async getProjectBudgetAnalytics(tenantId: string) {
    const projects = await this.prisma.project.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true,
        name: true,
        projectCode: true,
        plannedBudget: true,
        actualBudget: true,
        status: true,
      },
    });

    return projects.map((p) => {
      const variance = p.plannedBudget - p.actualBudget;
      const percentageUsed =
        p.plannedBudget > 0 ? (p.actualBudget / p.plannedBudget) * 100 : 0;
      return {
        projectId: p.id,
        name: p.name,
        projectCode: p.projectCode,
        plannedBudget: p.plannedBudget,
        actualBudget: p.actualBudget,
        variance,
        percentageUsed,
        status: p.status,
      };
    });
  }

  async getResourceUtilizationAnalytics(tenantId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, status: 'ACTIVE' },
      include: {
        projectMembers: {
          include: {
            project: true,
          },
        },
      },
    });

    return employees.map((emp) => {
      const activeMemberships = emp.projectMembers.filter(
        (m) =>
          m.project.deletedAt === null &&
          !['COMPLETED', 'CANCELLED'].includes(m.project.status),
      );
      const totalAllocation = activeMemberships.reduce(
        (sum, m) => sum + m.allocationPercentage,
        0,
      );

      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        totalAllocationPercentage: totalAllocation,
        projectsCount: activeMemberships.length,
        allocations: activeMemberships.map((m) => ({
          projectId: m.projectId,
          projectName: m.project.name,
          allocationPercentage: m.allocationPercentage,
        })),
      };
    });
  }

  async getDashboardLayout(userId: string, tenantId: string) {
    const savedLayout = await this.prisma.userDashboardLayout.findFirst({
      where: { userId, tenantId },
    });

    if (savedLayout) {
      return savedLayout.layout;
    }

    // Return beautiful, standard enterprise grid layout defaults
    return [
      { id: 'revenue', x: 0, y: 0, w: 6, h: 4, type: 'chart' },
      { id: 'expenses', x: 6, y: 0, w: 6, h: 4, type: 'chart' },
      { id: 'payroll', x: 0, y: 4, w: 4, h: 3, type: 'metric' },
      { id: 'inventory', x: 4, y: 4, w: 4, h: 3, type: 'metric' },
      { id: 'projects', x: 8, y: 4, w: 4, h: 3, type: 'metric' },
    ];
  }

  async saveDashboardLayout(userId: string, tenantId: string, layout: any) {
    const existing = await this.prisma.userDashboardLayout.findFirst({
      where: { userId, tenantId },
    });

    if (existing) {
      return this.prisma.userDashboardLayout.update({
        where: { id: existing.id },
        data: { layout },
      });
    }

    return this.prisma.userDashboardLayout.create({
      data: {
        userId,
        tenantId,
        layout,
      },
    });
  }
}
