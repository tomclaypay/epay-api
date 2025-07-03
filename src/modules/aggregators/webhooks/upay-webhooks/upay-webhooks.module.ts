import { UpayWebhooksController } from '@/modules/aggregators/webhooks/upay-webhooks/upay-webhooks.controller'
import { UpayWebhooksService } from '@/modules/aggregators/webhooks/upay-webhooks/upay-webhooks.service'
import { DepositsModule } from '@/modules/resources/deposits/deposits.module'
import { WithdrawalsModule } from '@/modules/resources/withdrawals/withdrawals.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule, DepositsModule, WithdrawalsModule],
  providers: [UpayWebhooksService],
  controllers: [UpayWebhooksController]
})
export class UpayWebhooksModule {}
