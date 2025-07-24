import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
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
}
