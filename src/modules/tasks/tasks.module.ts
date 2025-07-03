import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { BanksModule } from '../resources/banks/banks.module'
import { DepositsModule } from '../resources/deposits/deposits.module'
import { SettingsModule } from '../resources/settings/settings.module'
import { WithdrawalsModule } from '../resources/withdrawals/withdrawals.module'
import { NotificationsModule } from '../shared/notifications/notifications.module'
import { TasksService } from './tasks.service'
import { CallbacksModule } from '../shared/callbacks/callbacks.module'
import { VicaAdaptersModule } from '../adapters/vica-adapters/vica-adapters.module'
import { VirtualTransactionsModule } from '../resources/virtual-transactions/virtual-transactions.module'
import { SummaryCacheModule } from '@/modules/resources/summary-caches/summary-cache.module'
import { CashoutsModule } from '@/modules/resources/cashouts/cashouts.module'
import { RefreshTokensModule } from '@/modules/resources/refresh-token/refresh-token.module'
import { BankTransactionsModule } from '@/modules/resources/bank-transactions/bank-transactions.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BanksModule,
    BankTransactionsModule,
    DepositsModule,
    WithdrawalsModule,
    SettingsModule,
    NotificationsModule,
    CallbacksModule,
    VicaAdaptersModule,
    VirtualTransactionsModule,
    SummaryCacheModule,
    CashoutsModule,
    RefreshTokensModule
  ],
  providers: [TasksService]
})
export class TasksModule {}
