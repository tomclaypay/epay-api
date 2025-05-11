import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator'

export class UpdateSettingsDto {
  @ApiProperty({
    type: Boolean
  })
  @IsBoolean()
  @IsOptional()
  isUnderMaintenance: boolean

  @ApiProperty({
    type: Boolean
  })
  @IsBoolean()
  @IsOptional()
  isVpayEnabled: boolean

  @ApiProperty({
    type: Boolean
  })
  @IsBoolean()
  @IsOptional()
  isVirtualEnabled: boolean

  @ApiProperty({
    type: Boolean
  })
  @IsBoolean()
  @IsOptional()
  isAutoWithdrawal: boolean

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  depositFeeFlat: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  depositFeePct: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  withdrawFeeFlat: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  withdrawFeePct: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  depositVirtualFeeFlat: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  depositVirtualFeePct: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  cashoutFeeFlat: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  cashoutFeePct: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  expiredTime: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  minDepositAmount: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  maxDepositAmount: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  minWithdrawalAmount: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  maxWithdrawalAmount: number

  @ApiProperty()
  @IsArray()
  @IsOptional()
  withdrawalBanks: Array<string>

  @ApiProperty()
  @IsArray()
  @IsOptional()
  withdrawalBanksVov5: Array<string>

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  depositBackScanTime: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  depositAfterScanTime: number
}
