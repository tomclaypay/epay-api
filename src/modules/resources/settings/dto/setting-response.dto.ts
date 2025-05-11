import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsOptional } from 'class-validator'

export class SettingsResponse {
  @ApiProperty({
    type: Boolean
  })
  @IsBoolean()
  isUnderMaintenance: boolean

  @ApiProperty({
    type: Boolean
  })
  @IsBoolean()
  isVpayEnabled: boolean

  @ApiProperty({
    type: Boolean
  })
  @IsBoolean()
  isVirtualEnabled: boolean

  @ApiProperty({
    type: Boolean
  })
  @IsBoolean()
  @IsOptional()
  isXenditEnabled: boolean

  @ApiProperty()
  @IsNumber()
  depositFeeFlat: number

  @ApiProperty()
  @IsNumber()
  depositFeePct: number

  @ApiProperty()
  @IsNumber()
  depositVirtualFeeFlat: number

  @ApiProperty()
  @IsNumber()
  depositVirtualFeePct: number

  @ApiProperty()
  @IsNumber()
  withdrawFeeFlat: number

  @ApiProperty()
  @IsNumber()
  withdrawFeePct: number

  @ApiProperty()
  @IsNumber()
  expiredTime: number

  @ApiProperty()
  @IsNumber()
  minDepositAmount: number

  @ApiProperty()
  @IsNumber()
  maxDepositAmount: number

  @ApiProperty()
  @IsNumber()
  minWithdrawalAmount: number

  @ApiProperty()
  @IsNumber()
  maxWithdrawalAmount: number
}
