import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SettingSchema } from './settings.schema'
import { SettingsService } from './settings.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Setting', schema: SettingSchema }])
  ],
  providers: [SettingsService],
  exports: [SettingsService],
  controllers: []
})
export class SettingsModule {}
