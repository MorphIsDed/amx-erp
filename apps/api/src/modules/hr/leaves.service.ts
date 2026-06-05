import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrudService } from '../../common/services/crud.service';
import { Leave, LeaveStatus } from '@repo/db';
import { CreateLeaveDto, UpdateLeaveStatusDto } from './dto/hr.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LeavesService extends CrudService<Leave> {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {
    super(prisma.leave, false);
  }

  async createLeave(
    tenantId: string,
    employeeId: string,
    dto: CreateLeaveDto,
  ): Promise<Leave> {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const leave = await this.prisma.leave.create({
      data: {
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        type: dto.type,
        status: LeaveStatus.PENDING,
        reason: dto.reason,
        employeeId,
        tenantId,
      },
    });

    this.eventEmitter.emit('leave.created', { leave, tenantId });
    return leave;
  }

  async updateLeaveStatus(
    tenantId: string,
    id: string,
    dto: UpdateLeaveStatusDto,
    userId?: string,
  ): Promise<Leave> {
    const leave = await this.prisma.leave.findFirst({
      where: { id, tenantId },
      include: { employee: true },
    });

    if (!leave) throw new NotFoundException('Leave request not found');

    const updated = await this.prisma.leave.update({
      where: { id },
      data: { status: dto.status },
      include: { employee: true },
    });

    if (dto.status === LeaveStatus.APPROVED) {
      this.eventEmitter.emit('leave.approved', {
        leave: updated,
        tenantId,
        userId,
      });
    }

    this.eventEmitter.emit('audit.log', {
      action: `LEAVE_${dto.status}`,
      entityType: 'LEAVE',
      entityId: updated.id,
      tenantId,
      userId,
      details: { previousStatus: leave.status, newStatus: dto.status },
    });

    return updated;
  }
}
