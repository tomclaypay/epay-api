import { Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'

@Module({
  imports: [],
  providers: [NotificationsService],
  exports: [NotificationsService],
  controllers: []
})
export class NotificationsModule {}
