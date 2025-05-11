import { forwardRef, Global, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersModule } from '../users/users.module'
import { PassportModule } from '@nestjs/passport'
import { LocalStrategy } from './local.strategy'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './jwt.strategy'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ApiKeyStrategy } from './api-key-auth.strategy'
import { RefreshTokensModule } from '@/modules/resources/refresh-token/refresh-token.module'

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: `${configService.get('ACCESS_TOKEN_TTL')}s` }
      }),
      inject: [ConfigService]
    }),
    forwardRef(() => UsersModule),
    PassportModule,
    RefreshTokensModule
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, ApiKeyStrategy],
  exports: [AuthService]
})
export class AuthModule {}
