import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CustomerWalletSchema } from './customer-wallet.schema'
import { CustomerWalletsService } from './customer-wallets.service'
import { UpayAdapterModule } from '@/modules/adapters/upay/upay.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CustomerWallet', schema: CustomerWalletSchema }
    ]),
    UpayAdapterModule
  ],
  providers: [CustomerWalletsService],
  exports: [CustomerWalletsService],
  controllers: []
})
export class CustomerWalletsModule {}
