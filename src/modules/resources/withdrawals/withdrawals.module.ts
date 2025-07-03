import { NotificationsModule } from '@/modules/shared/notifications/notifications.module'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SettingsModule } from '../settings/settings.module'
import { WithdrawalSchema } from './withdrawals.schema'
import { WithdrawalsService } from './withdrawals.service'
import { UpayAdapterModule } from '@/modules/adapters/upay/upay.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Withdrawal', schema: WithdrawalSchema }
    ]),
    SettingsModule,
    NotificationsModule,
    UpayAdapterModule
  ],
  providers: [WithdrawalsService],
  exports: [WithdrawalsService],
  controllers: []
})
export class WithdrawalsModule {}
