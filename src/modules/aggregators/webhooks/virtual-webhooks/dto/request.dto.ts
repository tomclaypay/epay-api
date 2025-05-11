import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { VirtualServiceCode } from '@/modules/resources/virtual-transactions/dto/general.dto'

export class HandleVirtualWebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transcode: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  orderTranscode: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  responseCode: number

  @ApiProperty()
  @IsString()
  @IsOptional()
  serviceCode: VirtualServiceCode

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  responseMessage: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  paidAmount: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  transferAmount: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  orderExpiryTime: number

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankCode: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankName: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankBranch: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankAccountNo: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankAccountName: string

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  bankAccountStatus: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  responseSignature: string
}

export class HandleXenditWebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  event: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  business_id: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  created: string

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  data: Object

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  responseSignature: string
}

export class HandleCreateVAVov5WebhookDto {
  @ApiProperty()
  @IsNumber()
  id: number

  @ApiProperty()
  @IsNumber()
  amount: number

  @ApiProperty()
  @IsString()
  tranDate: string

  @ApiProperty()
  @IsString()
  tranId: string

  @ApiProperty()
  @IsString()
  bankId: string

  @ApiProperty()
  @IsString()
  accountNumber: string

  @ApiProperty()
  @IsString()
  accountName: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsString()
  vaRequestId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  responseSignature: string
}

export class HandleTransferVov5WebhookDto {
  @ApiProperty()
  @IsNumber()
  id: number

  @ApiProperty()
  @IsString()
  requestId: string

  @ApiProperty()
  @IsString()
  ftType: string

  @ApiProperty()
  @IsString()
  numberOfBeneficiary: string

  @ApiProperty()
  @IsString()
  nameOfBeneficiary: string

  @ApiProperty()
  @IsNumber()
  amount: number

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsString()
  bankId: string

  @ApiProperty()
  @IsString()
  refNum: string

  @ApiProperty()
  @IsNumber()
  status: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  responseSignature: string
}
