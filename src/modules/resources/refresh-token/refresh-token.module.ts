import { RefreshTokensSchema } from '@/modules/resources/refresh-token/refresh-token.schema'
import { RefreshTokensService } from '@/modules/resources/refresh-token/refresh-token.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'RefreshTokens', schema: RefreshTokensSchema }
    ])
  ],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService],
  controllers: []
})
export class RefreshTokensModule {}
