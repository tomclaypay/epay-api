import { CashoutStatus } from '@/modules/common/dto/general.dto'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'

export class CreateCashoutOrderDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ref: string

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isCrypto: string

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee: number

  @ApiProperty()
  @IsString()
  @IsOptional()
  note?: string
}

export class CreateCashoutOrderByUserDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ref: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chainName: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  walletAddress: string

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  vndPerUsdt?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  actualAmountUsdt?: number
}

export class UpdateCashoutOrderDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  amount?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee: number

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isCrypto?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  ref?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  note?: string

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  actualAmountUsdt?: number

  @ApiProperty()
  @IsEnum(CashoutStatus)
  @IsOptional()
  status?: CashoutStatus
}
