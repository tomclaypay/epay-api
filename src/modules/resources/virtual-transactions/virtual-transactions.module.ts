import { NotificationsModule } from '@/modules/shared/notifications/notifications.module'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { VirtualTransactionSchema } from './virtual-transactions.schema'
import { VirtualTransactionsService } from './virtual-transactions.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'VirtualTransaction', schema: VirtualTransactionSchema }
    ]),
    NotificationsModule
  ],
  providers: [VirtualTransactionsService],
  exports: [VirtualTransactionsService],
  controllers: []
})
export class VirtualTransactionsModule {}
