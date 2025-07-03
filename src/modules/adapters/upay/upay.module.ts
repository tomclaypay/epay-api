import { UpayAdapterService } from '@/modules/adapters/upay/upay.service'
import { Module } from '@nestjs/common'

@Module({
  imports: [],
  providers: [UpayAdapterService],
  exports: [UpayAdapterService],
  controllers: []
})
export class UpayAdapterModule {}
