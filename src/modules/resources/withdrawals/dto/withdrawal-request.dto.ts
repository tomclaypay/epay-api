import { ChainName } from '@/common/const/general'
import { DataTableParams } from '@/common/params/DataTableParams'
import { OrderStatus } from '@/modules/common/dto/general.dto'
import { PaginationQueriesDto } from '@/modules/common/dto/pagination.dto'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'

export class CreateWithdrawalOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankNameDest: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankAccountNumberDest: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankAccountNameDest: string

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
  mt5Id?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  callback: string
}

export class UpdateWithdrawalOrderDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  bankNameSrc?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankNameDest?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankAccountNameDest?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankAccountSrc?: string

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee?: number

  @ApiProperty()
  @IsString()
  @IsOptional()
  status?: OrderStatus

  @ApiProperty()
  @IsString()
  @IsOptional()
  transaction?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  virtualTransaction?: string

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isManual?: boolean

  @ApiProperty()
  @IsString()
  @IsOptional()
  manualBy?: string

  @ApiProperty()
  @IsDate()
  @IsOptional()
  manualAt?: Date

  @ApiProperty()
  @IsString()
  @IsOptional()
  note?: string
}

export class GetWithdrawalsQueriesDto extends PaginationQueriesDto {
  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  status: string
}

export class WithdrawalListing extends DataTableParams {
  @ApiProperty()
  @IsOptional()
  isManual: string

  @ApiProperty()
  @IsOptional()
  status: string
}

export class WithdrawalListingForExport {
  @ApiProperty()
  @IsOptional()
  isManual: string

  @ApiProperty()
  @IsOptional()
  status: string

  @ApiProperty()
  @IsOptional()
  startDate: Date

  @ApiProperty()
  @IsOptional()
  endDate: Date
}
export class ManualWithdrawalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankNameSrc: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankAccountSrc: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  actualAmount: number
}

export class UpdateWithdrawalStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  note: string
}

export class CreateWithdrawalOrderByCryptoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string

  @ApiProperty()
  @IsEnum(ChainName)
  @IsNotEmpty()
  chainName: ChainName

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mt5Id: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ref: string

  @ApiProperty()
  @IsNotEmpty()
  usdtAmount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toAddress: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  callback: string
}

export class UpdateWithdrawalOrderByCryptoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  txHash: string

  @ApiProperty()
  @IsNotEmpty()
  status: OrderStatus

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  usdtFee: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerWallet: string
}
