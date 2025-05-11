import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SettingsModule } from '../settings/settings.module'
import { CashoutSchema } from './cashouts.schema'
import { CashoutsService } from './cashouts.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Cashout', schema: CashoutSchema }]),
    SettingsModule
  ],
  providers: [CashoutsService],
  exports: [CashoutsService],
  controllers: []
})
export class CashoutsModule {}
