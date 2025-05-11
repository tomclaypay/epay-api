import { Module } from '@nestjs/common'
import { VicaAdaptersService } from './vica-adapters.service'

@Module({
  imports: [],
  providers: [VicaAdaptersService],
  exports: [VicaAdaptersService],
  controllers: []
})
export class VicaAdaptersModule {}
