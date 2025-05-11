import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TransactionsService } from './transactions.service'
import { TransactionSchema } from './transactions.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Transaction', schema: TransactionSchema }
    ])
  ],
  providers: [TransactionsService],
  exports: [TransactionsService],
  controllers: []
})
export class TransactionsModule {}
