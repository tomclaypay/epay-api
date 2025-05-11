import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

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
  @IsString()
  @IsOptional()
  ref?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  note?: string
}
