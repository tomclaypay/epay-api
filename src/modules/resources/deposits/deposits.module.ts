import { NotificationsModule } from '@/modules/shared/notifications/notifications.module'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SettingsModule } from '../settings/settings.module'
import { DepositSchema } from './deposits.schema'
import { DepositsService } from './deposits.service'
import { VicaAdaptersModule } from '@/modules/adapters/vica-adapters/vica-adapters.module'
import { VirtualTransactionsModule } from '../virtual-transactions/virtual-transactions.module'
import { TransactionsModule } from '@/modules/resources/transactions/transactions.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Deposit', schema: DepositSchema }]),
    SettingsModule,
    NotificationsModule,
    VicaAdaptersModule,
    VirtualTransactionsModule,
    TransactionsModule
  ],
  providers: [DepositsService],
  exports: [DepositsService],
  controllers: []
})
export class DepositsModule {}
