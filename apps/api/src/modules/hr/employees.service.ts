import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createEmployeeDto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    query: {
      skip?: number;
      take?: number;
      search?: string;
      departmentId?: string;
      status?: any;
    },
  ) {
    const { skip, take, search, departmentId, status } = query;

    return this.prisma.employee.findMany({
      where: {
        tenantId,
        departmentId,
        status,
        OR: search
          ? [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { employeeId: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      include: {
        department: true,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
      include: { department: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(
    tenantId: string,
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.prisma.employee.updateMany({
      where: { id, tenantId },
      data: updateEmployeeDto,
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.employee.deleteMany({
      where: { id, tenantId },
    });
  }
}
