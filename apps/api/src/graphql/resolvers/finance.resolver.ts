import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { InvoiceModel } from '../models/invoice.model';
import { InvoicesService } from '../../modules/finance/invoices.service';

@Resolver(() => InvoiceModel)
@UseGuards(GqlAuthGuard)
export class FinanceResolver {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Query(() => [InvoiceModel])
  async invoices(
    @CurrentUser() user: any,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('status', { nullable: true }) status?: string,
  ) {
    const result = await this.invoicesService.findAll(user.tenantId, { skip, take, status });
    return result.data;
  }

  @Query(() => InvoiceModel)
  async invoice(@CurrentUser() user: any, @Args('id') id: string) {
    const result = await this.invoicesService.findOne(user.tenantId, id);
    return result.data;
  }
}
