import { BankTransactionSchema } from '@/modules/resources/transactions/bank-transactions.schema'
import { BankTransactionsService } from '@/modules/resources/transactions/bank-transactions.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BankTransaction', schema: BankTransactionSchema }
    ])
  ],
  providers: [BankTransactionsService],
  exports: [BankTransactionsService],
  controllers: []
})
export class BankTransactionsModule {}
