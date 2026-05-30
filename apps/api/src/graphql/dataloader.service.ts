import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DataLoaderService {
  constructor(private readonly prisma: PrismaService) {}

  createLoaders() {
    return {
      departmentLoader: new DataLoader(async (keys: readonly string[]) => {
        const departments = await this.prisma.department.findMany({
          where: { id: { in: [...keys] } },
        });
        const map = new Map(departments.map((d) => [d.id, d]));
        return keys.map((key) => map.get(key) || null);
      }),

      employeeLoader: new DataLoader(async (keys: readonly string[]) => {
        const employees = await this.prisma.employee.findMany({
          where: { id: { in: [...keys] } },
        });
        const map = new Map(employees.map((e) => [e.id, e]));
        return keys.map((key) => map.get(key) || null);
      }),
    };
  }
}
export type IGraphQLContext = {
  req: any;
  loaders: any;
};
