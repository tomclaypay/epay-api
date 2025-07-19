import { PaginationQueriesDto } from '@/modules/common/dto/pagination.dto'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl
} from 'class-validator'
import { DataTableParams } from '@/common/params/DataTableParams'
import { OrderStatus } from '@/modules/common/dto/general.dto'
import { ChainName } from '@/common/const/general'

export class GetDepositsQueriesDto extends PaginationQueriesDto {
  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  status: string
}

export class CreateDepositOrderDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  type?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  mt5Id?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ref: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  callback: string
}

export class CreateDepositOrderByCryptoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mt5Id: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerWallet: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  upayOrderRef: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  usdAmount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  callback: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: OrderStatus

  @ApiProperty()
  @IsOptional()
  chainName?: ChainName

  @ApiProperty()
  @IsString()
  @IsOptional()
  txHash?: string

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  usdFee?: number
}

export class UpdateDepositOrderDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  actualAmount?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  usdFee?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  exchangeRate?: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  usdActualAmount?: number

  @IsString()
  @IsOptional()
  refXendit?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  status?: OrderStatus

  @ApiProperty()
  @IsArray()
  @IsOptional()
  virtualTransactions?: [string]

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isManual?: boolean

  @ApiProperty()
  @IsArray()
  @IsOptional()
  updatedNotes?: string[]
}

export class DepositListing extends DataTableParams {
  @ApiProperty()
  @IsOptional()
  isManual: string

  @ApiProperty()
  @IsOptional()
  status: string

  @ApiProperty()
  @IsOptional()
  type: string
}
export class DepositListingForExport extends DataTableParams {
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

  @ApiProperty()
  @IsOptional()
  type: string
}

export class ManualDepositDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  actualAmount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionId: string
}

export class ManualDepositsDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  actualAmount: number

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  transactionIds: [string]
}
