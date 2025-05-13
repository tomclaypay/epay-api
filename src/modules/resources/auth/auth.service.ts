import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { RefreshTokensService } from '@/modules/resources/refresh-token/refresh-token.service'
import { access } from 'fs'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokensService: RefreshTokensService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.attempt(username, pass)
    if (user) {
      return user
    }

    return null
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      id: user._id,
      fullName: user.fullName,
      avatar: user.avatar
    }
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: parseInt(process.env.REFRESH_TOKEN_TTL),
      secret: process.env.REFRESH_TOKEN_SECRET
    })
    const decodedRefreshToken = await this.jwtService.verifyAsync(
      refreshToken,
      {
        secret: process.env.REFRESH_TOKEN_SECRET
      }
    )
    const refreshTokenExpiresAt = new Date(decodedRefreshToken.exp * 1000)

    await this.refreshTokensService.createRefreshToken({
      userId: user._id,
      token: refreshToken,
      username: user.username,
      expiresAt: refreshTokenExpiresAt
    })
    return {
      id: user._id,
      accessToken: this.jwtService.sign(payload, {
        expiresIn: parseInt(process.env.ACCESS_TOKEN_TTL),
        secret: process.env.ACCESS_TOKEN_SECRET
      }),
      refreshToken,
      expiresIn: parseInt(process.env.ACCESS_TOKEN_TTL)
    }
  }

  async refresh(refreshToken: string) {
    try {
      const decodedRefreshToken: {
        username: string
        id: string
        fullName: string
        avatar: string
        iat: number
        exp: number
      } = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET
      })
      if (!decodedRefreshToken) {
        throw new HttpException(
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED
        )
      }
      const refreshTokenDoc = await this.refreshTokensService.getRefreshToken(
        refreshToken
      )
      if (!refreshTokenDoc) {
        throw new HttpException(
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED
        )
      }
      const user = await this.usersService.getUserByUsername(
        refreshTokenDoc.username
      )
      if (!user) {
        return null
      }
      const payload = {
        username: user.username,
        id: user._id,
        fullName: user.fullName
      }

      const refreshTokenNew = this.jwtService.sign(payload, {
        expiresIn: parseInt(process.env.REFRESH_TOKEN_TTL),
        secret: process.env.REFRESH_TOKEN_SECRET
      })

      await this.refreshTokensService.deleteRefreshToken(refreshToken)

      await this.refreshTokensService.createRefreshToken({
        userId: user._id,
        token: refreshTokenNew,
        username: user.username,
        expiresAt: refreshTokenDoc.expiresAt
      })

      return {
        id: user._id,
        accessToken: this.jwtService.sign(payload, {
          expiresIn: parseInt(process.env.ACCESS_TOKEN_TTL)
        }),
        refreshToken: refreshTokenNew,
        expiresIn: parseInt(process.env.ACCESS_TOKEN_TTL)
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  async verifyToken(token) {
    try {
      const decodeToken = this.jwtService.decode(token)

      if (decodeToken) {
        return decodeToken
      }
    } catch (e) {}

    return false
  }
}
