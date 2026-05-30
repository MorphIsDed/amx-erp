import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { FinanceModule } from '../modules/finance/finance.module';
import { HrModule } from '../modules/hr/hr.module';
import { ProjectsModule } from '../modules/projects/projects.module';
import { InventoryModule } from '../modules/inventory/inventory.module';
import { AnalyticsModule } from '../modules/analytics/analytics.module';
import { PrismaModule } from '../prisma/prisma.module';

import { FinanceResolver } from './resolvers/finance.resolver';
import { EmployeesResolver } from './resolvers/employees.resolver';
import { ProjectsResolver } from './resolvers/projects.resolver';
import { InventoryResolver } from './resolvers/inventory.resolver';
import { AnalyticsResolver } from './resolvers/analytics.resolver';

import { DataLoaderService } from './dataloader.service';
import { DataLoaderModule } from './dataloader.module';

@Module({
  imports: [
    PrismaModule,
    DataLoaderModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataLoaderModule],
      useFactory: (dataLoaderService: DataLoaderService) => ({
        autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
        sortSchema: true,
        playground: true,
        context: ({ req }) => ({
          req,
          loaders: dataLoaderService.createLoaders(),
        }),
      }),
      inject: [DataLoaderService],
    }),
    FinanceModule,
    HrModule,
    ProjectsModule,
    InventoryModule,
    AnalyticsModule,
  ],
  providers: [
    FinanceResolver,
    EmployeesResolver,
    ProjectsResolver,
    InventoryResolver,
    AnalyticsResolver,
  ],
})
export class AppGraphQLModule {}
