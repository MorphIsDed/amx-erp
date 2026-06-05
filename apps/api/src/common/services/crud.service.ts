import { NotFoundException } from '@nestjs/common';

export class CrudService<Entity> {
  constructor(
    protected readonly model: any,
    protected readonly hasSoftDelete: boolean = false,
  ) {}

  async create(tenantId: string, data: any): Promise<Entity> {
    return await this.model.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    query?: any,
  ): Promise<{ data: Entity[]; meta?: any }> {
    const { skip, take, orderBy, where } = query || {};
    const whereClause: any = { ...where, tenantId };
    if (this.hasSoftDelete) {
      whereClause.deletedAt = null;
    }

    const data = await this.model.findMany({
      where: whereClause,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      orderBy,
    });
    return { data };
  }

  async findOne(tenantId: string, id: string): Promise<{ data: Entity }> {
    const whereClause: any = { id, tenantId };
    if (this.hasSoftDelete) {
      whereClause.deletedAt = null;
    }

    const data = await this.model.findFirst({
      where: whereClause,
    });

    if (!data) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return { data };
  }

  async update(
    tenantId: string,
    id: string,
    data: any,
  ): Promise<{ data: Entity }> {
    const whereClause: any = { id, tenantId };
    if (this.hasSoftDelete) {
      whereClause.deletedAt = null;
    }

    const existing = await this.model.findFirst({
      where: whereClause,
    });

    if (!existing) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    const updated = await this.model.update({
      where: { id },
      data,
    });

    return { data: updated };
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const whereClause: any = { id, tenantId };
    if (this.hasSoftDelete) {
      whereClause.deletedAt = null;
    }

    const existing = await this.model.findFirst({
      where: whereClause,
    });

    if (!existing) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    if (this.hasSoftDelete) {
      await this.model.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } else {
      await this.model.delete({
        where: { id },
      });
    }
  }
}
