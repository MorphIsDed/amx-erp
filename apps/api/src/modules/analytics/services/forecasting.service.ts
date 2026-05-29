import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface ForecastData {
  month: string;
  actual: number | null;
  predicted: number;
}

export interface InventoryInsight {
  id: string;
  name: string;
  sku: string;
  dailyBurnRate: number;
  daysRemaining: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

@Injectable()
export class ForecastingService {
  constructor(private prisma: PrismaService) {}

  async getRevenueForecast(tenantId: string): Promise<ForecastData[]> {
    const historicalInvoices = await this.prisma.invoice.findMany({
      where: { tenantId, status: 'PAID' },
      orderBy: { issueDate: 'asc' },
    });

    const monthlyData: Record<string, number> = {};
    historicalInvoices.forEach((inv) => {
      const month = inv.issueDate.toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + inv.totalAmount;
    });

    const labels = Object.keys(monthlyData).sort();
    const values = labels.map((l) => monthlyData[l]);

    const lastValue = values[values.length - 1] || 0;
    const growthRate =
      values.length > 1
        ? Math.pow(lastValue / values[0], 1 / values.length)
        : 1.05;

    const forecast: ForecastData[] = [];
    for (let i = 1; i <= 6; i++) {
      forecast.push({
        month: `Forecast +${i}M`,
        actual: null,
        predicted: Math.round(lastValue * Math.pow(growthRate, i)),
      });
    }

    const actuals: ForecastData[] = labels.map((l) => ({
      month: l,
      actual: monthlyData[l],
      predicted: Math.round(monthlyData[l] * 0.98),
    }));

    return [...actuals, ...forecast];
  }

  async getInventoryForecast(tenantId: string): Promise<InventoryInsight[]> {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: {
        stockMovements: {
          where: { type: 'OUT' },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    return products
      .map((p) => {
        const totalOut = p.stockMovements.reduce(
          (acc, curr) => acc + curr.quantity,
          0,
        );
        const days =
          p.stockMovements.length > 1
            ? (p.stockMovements[0].createdAt.getTime() -
                p.stockMovements[
                  p.stockMovements.length - 1
                ].createdAt.getTime()) /
              (1000 * 60 * 60 * 24)
            : 30;

        const dailyBurnRate = totalOut / (days || 1);
        const riskLevel: InventoryInsight['riskLevel'] =
          dailyBurnRate > 5 ? 'HIGH' : dailyBurnRate > 2 ? 'MEDIUM' : 'LOW';

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          dailyBurnRate: Math.round(dailyBurnRate * 10) / 10,
          daysRemaining:
            dailyBurnRate > 0 ? Math.round(100 / dailyBurnRate) : 999,
          riskLevel,
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5);
  }
}
