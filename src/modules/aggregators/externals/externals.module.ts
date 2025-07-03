import { Module } from '@nestjs/common'
import { AuthModule } from '../../resources/auth/auth.module'
import { BanksModule } from '../../resources/banks/banks.module'
import { DepositsModule } from '../../resources/deposits/deposits.module'
import { SettingsModule } from '../../resources/settings/settings.module'
import { BankTransactionsModule } from '../../resources/bank-transactions/bank-transactions.module'
import { UsersModule } from '../../resources/users/users.module'
import { WithdrawalsModule } from '../../resources/withdrawals/withdrawals.module'
import { ExternalsController } from './externals.controller'
import { ExternalsService } from './externals.service'
import { VirtualTransactionsModule } from '@/modules/resources/virtual-transactions/virtual-transactions.module'
import { VicaAdaptersModule } from '@/modules/adapters/vica-adapters/vica-adapters.module'
import { CustomerWalletsModule } from '@/modules/resources/customer-wallets/customer-wallets.module'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DepositsModule,
    WithdrawalsModule,
    BanksModule,
    BankTransactionsModule,
    SettingsModule,
    VirtualTransactionsModule,
    VicaAdaptersModule,
    CustomerWalletsModule
  ],
  providers: [ExternalsService],
  controllers: [ExternalsController]
})
export class ExternalsModule {}
