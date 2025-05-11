import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SummaryCacheSchema } from './summary-cache.schema'
import { SummaryCachesService } from './summary-cache.service'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SummaryCache', schema: SummaryCacheSchema }
    ])
  ],
  providers: [SummaryCachesService],
  exports: [SummaryCachesService]
})
export class SummaryCacheModule {}
