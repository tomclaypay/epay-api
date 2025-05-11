import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { RefreshTokens } from '@/modules/resources/refresh-token/refresh-token.interface'
import { CreateRefreshTokenDto } from '@/modules/resources/refresh-token/dto/refresh-token-request.dto'

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectModel('RefreshTokens')
    private refreshTokenModel: Model<RefreshTokens>
  ) {}

  async getRefreshToken(refreshToken: string) {
    return await this.refreshTokenModel.findOne({ token: refreshToken })
  }

  async createRefreshToken(createRefreshTokenDto: CreateRefreshTokenDto) {
    return await this.refreshTokenModel.create(createRefreshTokenDto)
  }

  async deleteRefreshToken(refreshToken: string) {
    return await this.refreshTokenModel.deleteOne({ token: refreshToken })
  }

  async autoRemoveRefreshToken() {
    return await this.refreshTokenModel.deleteMany({
      expiresAt: { $lt: new Date() }
    })
  }
}
