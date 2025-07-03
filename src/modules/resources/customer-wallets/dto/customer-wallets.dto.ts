import { ChainName } from '@/common/const/general'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl
} from 'class-validator'

export class CreateCustomerWalletDto {
  @IsString()
  @IsNotEmpty()
  mt5Id: string

  @IsString()
  @IsNotEmpty()
  customerId: string

  @IsString()
  @IsOptional()
  evmAddress?: string

  @IsString()
  @IsOptional()
  tronAddress?: string

  @IsString()
  @IsNotEmpty()
  callback: string
}

export class UpdateCustomerWalletDto {
  @IsString()
  @IsOptional()
  mt5Id?: string

  @IsString()
  @IsOptional()
  evmAddress?: string

  @IsString()
  @IsOptional()
  tronAddress?: string
}

export class GetWalletAddressByCustomerIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ChainName)
  chainName: ChainName

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  mt5Id?: string

  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  callback: string
}
