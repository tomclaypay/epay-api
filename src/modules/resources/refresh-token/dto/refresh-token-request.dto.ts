import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class RefreshTokensRequest {
  @ApiProperty({
    type: Boolean
  })
  @IsBoolean()
  @IsOptional()
  refreshToken: boolean
}

export class CreateRefreshTokenDto {
  @ApiProperty({
    type: String
  })
  @IsString()
  @IsOptional()
  userId: string

  @ApiProperty({
    type: String
  })
  @IsString()
  @IsOptional()
  token: string

  @ApiProperty({
    type: String
  })
  @IsString()
  @IsOptional()
  username: string

  @ApiProperty({
    type: Date
  })
  @IsString()
  @IsOptional()
  expiresAt: Date
}
