import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BankSchema } from './banks.schema'
import { BanksService } from './banks.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Bank', schema: BankSchema }])],
  providers: [BanksService],
  exports: [BanksService],
  controllers: []
})
export class BanksModule {}
