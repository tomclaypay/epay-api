import { NotificationsModule } from '@/modules/shared/notifications/notifications.module'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SettingsModule } from '../settings/settings.module'
import { DepositSchema } from './deposits.schema'
import { DepositsService } from './deposits.service'
import { VicaAdaptersModule } from '@/modules/adapters/vica-adapters/vica-adapters.module'
import { VirtualTransactionsModule } from '../virtual-transactions/virtual-transactions.module'
import { BankTransactionsModule } from '@/modules/resources/bank-transactions/bank-transactions.module'
import { CustomerWalletsModule } from '@/modules/resources/customer-wallets/customer-wallets.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Deposit', schema: DepositSchema }]),
    SettingsModule,
    NotificationsModule,
    VicaAdaptersModule,
    VirtualTransactionsModule,
    BankTransactionsModule,
    CustomerWalletsModule
  ],
  providers: [DepositsService],
  exports: [DepositsService],
  controllers: []
})
export class DepositsModule {}
