import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ChainName } from '@/common/const/general'

export class UpayWebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  merchantCode: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderId: string

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  orderType: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chainName: ChainName

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  txHash: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  secretKey: string

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee: number
}
