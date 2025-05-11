import { Module } from '@nestjs/common'
import { CallbacksService } from './callbacks.service'

@Module({
  imports: [],
  providers: [CallbacksService],
  exports: [CallbacksService],
  controllers: []
})
export class CallbacksModule {}
