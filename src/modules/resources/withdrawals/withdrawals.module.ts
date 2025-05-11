import { NotificationsModule } from '@/modules/shared/notifications/notifications.module'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SettingsModule } from '../settings/settings.module'
import { WithdrawalSchema } from './withdrawals.schema'
import { WithdrawalsService } from './withdrawals.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Withdrawal', schema: WithdrawalSchema }
    ]),
    SettingsModule,
    NotificationsModule
  ],
  providers: [WithdrawalsService],
  exports: [WithdrawalsService],
  controllers: []
})
export class WithdrawalsModule {}
