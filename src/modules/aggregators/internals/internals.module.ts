import { BanksModule } from '@/modules/resources/banks/banks.module'
import { DepositsModule } from '@/modules/resources/deposits/deposits.module'
import { Module } from '@nestjs/common'
import { InternalsController } from './internals.controller'
import { InternalsService } from './internals.service'
import { SettingsModule } from '@/modules/resources/settings/settings.module'
import { VirtualTransactionsModule } from '@/modules/resources/virtual-transactions/virtual-transactions.module'
import { CustomerWalletsModule } from '@/modules/resources/customer-wallets/customer-wallets.module'

@Module({
  imports: [
    DepositsModule,
    BanksModule,
    SettingsModule,
    VirtualTransactionsModule
  ],
  providers: [InternalsService],
  controllers: [InternalsController]
})
export class InternalsModule {}
