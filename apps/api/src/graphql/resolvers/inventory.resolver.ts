import { Resolver, Query, Args, ID, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ProductModel } from '../models/product.model';
import { InventoryService } from '../../modules/inventory/services/inventory.service';

@Resolver(() => ProductModel)
@UseGuards(GqlAuthGuard)
export class InventoryResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  @Query(() => [ProductModel])
  async products(@CurrentUser() user: any) {
    return this.inventoryService.getProducts(user.tenantId);
  }

  @Query(() => Float)
  async productStockLevel(
    @CurrentUser() user: any,
    @Args('productId', { type: () => ID }) productId: string,
  ) {
    return this.inventoryService.getStockLevel(user.tenantId, productId);
  }
}
