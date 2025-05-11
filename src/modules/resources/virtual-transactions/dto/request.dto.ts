import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsBoolean
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { VirtualServiceCode, VirtualTransactionStatus } from './general.dto'

export class CreateVirtualTransactionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  depositOrder: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceCode: VirtualServiceCode

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  returnUrl: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cancelUrl: string
}

export class UpdateVirtualTransactionDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  status?: VirtualTransactionStatus

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  paidAmount?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  transferAmount?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  orderExpiryTime?: number

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isBankAccountEnabled?: boolean

  @IsEmail()
  @IsString()
  @IsOptional()
  bankCode?: string

  @IsPhoneNumber()
  @IsString()
  @IsOptional()
  bankName?: string

  @IsString()
  @IsString()
  @IsOptional()
  bankAccountNo?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankAccountName?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  qrUrl?: string
}
