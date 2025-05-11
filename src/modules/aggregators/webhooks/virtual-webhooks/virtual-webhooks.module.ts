import { Module } from '@nestjs/common'
import { VirtualWebhooksController } from './virtual-webhooks.controller'
import { VirtualWebhooksService } from './virtual-webhooks.service'
import { NotificationsModule } from '@/modules/shared/notifications/notifications.module'
import { CallbacksModule } from '@/modules/shared/callbacks/callbacks.module'
import { DepositsModule } from '@/modules/resources/deposits/deposits.module'
import { SettingsModule } from '@/modules/resources/settings/settings.module'
import { VirtualTransactionsModule } from '@/modules/resources/virtual-transactions/virtual-transactions.module'
import { VicaAdaptersModule } from '@/modules/adapters/vica-adapters/vica-adapters.module'
import { WithdrawalsModule } from '@/modules/resources/withdrawals/withdrawals.module'

@Module({
  imports: [
    DepositsModule,
    SettingsModule,
    VicaAdaptersModule,
    VirtualTransactionsModule,
    NotificationsModule,
    CallbacksModule,
    WithdrawalsModule
  ],
  providers: [VirtualWebhooksService],
  controllers: [VirtualWebhooksController]
})
export class VirtualWebhooksModule {}
