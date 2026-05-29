import { NotFoundException } from '@nestjs/common';

export class CrudService<Entity> {
  constructor(protected readonly model: any) {}

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
    const data = await this.model.findMany({
      where: { ...where, tenantId, deletedAt: null },
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      orderBy,
    });
    return { data };
  }

  async findOne(tenantId: string, id: string): Promise<{ data: Entity }> {
    const data = await this.model.findFirst({
      where: { id, tenantId, deletedAt: null },
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
    const existing = await this.model.findFirst({
      where: { id, tenantId, deletedAt: null },
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
    const existing = await this.model.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    await this.model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
