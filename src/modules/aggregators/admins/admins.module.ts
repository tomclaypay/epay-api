import { SettingsModule } from '../../resources/settings/settings.module'
import { Module } from '@nestjs/common'
import { AuthModule } from '../../resources/auth/auth.module'
import { BanksModule } from '../../resources/banks/banks.module'
import { DepositsModule } from '../../resources/deposits/deposits.module'
import { PermissionModule } from '../../resources/permission/permission.module'
import { RoleModule } from '../../resources/role/role.module'
import { UsersModule } from '../../resources/users/users.module'
import { AdminsController } from './admins.controller'
import { AdminsService } from './admins.service'
import { WithdrawalsModule } from '../../resources/withdrawals/withdrawals.module'
import { CashoutsModule } from '@/modules/resources/cashouts/cashouts.module'
import { ConfigModule } from '@nestjs/config'
import { VicaAdaptersModule } from '@/modules/adapters/vica-adapters/vica-adapters.module'
import { VirtualTransactionsModule } from '@/modules/resources/virtual-transactions/virtual-transactions.module'
import { SummaryCacheModule } from '@/modules/resources/summary-caches/summary-cache.module'
import { RefreshTokensModule } from '@/modules/resources/refresh-token/refresh-token.module'
import { BankTransactionsModule } from '@/modules/resources/bank-transactions/bank-transactions.module'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DepositsModule,
    BanksModule,
    BankTransactionsModule,
    CashoutsModule,
    PermissionModule,
    RoleModule,
    WithdrawalsModule,
    SettingsModule,
    ConfigModule,
    VicaAdaptersModule,
    VirtualTransactionsModule,
    SummaryCacheModule,
    RefreshTokensModule
  ],
  providers: [AdminsService],
  controllers: [AdminsController]
})
export class AdminsModule {}
