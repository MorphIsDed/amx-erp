import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { Prisma, EmployeeStatus } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: createEmployeeDto,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    departmentId?: string;
    status?: string;
  }) {
    const { skip = 0, take = 10, search, departmentId, status } = params;

    const where: Prisma.EmployeeWhereInput = {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { employeeId: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(departmentId && { departmentId }),
      ...(status && { status: status as EmployeeStatus }),
    };

    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({
        skip: skip ? Number(skip) : 0,
        take: take ? Number(take) : 10,
        where,
        include: { department: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { items, meta: { total, skip, take } };
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const exists = await this.prisma.employee.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Employee with ID ${id} not found`);
    
    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  async remove(id: string) {
    return this.prisma.employee.delete({ where: { id } });
  }
}