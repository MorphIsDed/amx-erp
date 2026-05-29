import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardOverview(tenantId: string) {
    const [revenueData, inventoryData, employeeCount, recentActivity] =
      await Promise.all([
        // Revenue (Paid Invoices)
        this.prisma.invoice.aggregate({
          where: { tenantId, status: 'PAID' },
          _sum: { totalAmount: true },
        }),
        // Inventory (Total Stock Items)
        this.prisma.product.count({
          where: { tenantId },
        }),
        // Employees
        this.prisma.employee.count({
          where: { tenantId, status: 'ACTIVE' },
        }),
        // Recent Activity
        this.prisma.activityLog.findMany({
          where: { tenantId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } },
        }),
      ]);

    // Monthly Revenue Trend (Last 6 months)
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
        growth: 12.5, // Mocked for now
      },
      revenueTrend: this.formatMonthlyTrend(monthlyRevenue),
      recentActivity,
    };
  }

  private formatMonthlyTrend(data: any[]) {
    // Basic formatting logic to group by month name
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
}
