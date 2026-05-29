import { Field, ObjectType, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class InvoiceModel {
  @Field(() => ID)
  id: string;

  @Field()
  invoiceNumber: string;

  @Field()
  status: string;

  @Field()
  issueDate: Date;

  @Field()
  dueDate: Date;

  @Field()
  currency: string;

  @Field(() => Float)
  exchangeRate: number;

  @Field(() => Float)
  subTotal: number;

  @Field(() => Float)
  taxTotal: number;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Float)
  amountPaid: number;

  @Field()
  clientName: string;

  @Field({ nullable: true })
  clientEmail?: string;

  @Field({ nullable: true })
  clientAddress?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  tenantId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
