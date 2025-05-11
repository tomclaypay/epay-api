import { PaginationQueriesDto } from '@/modules/common/dto/pagination.dto'
import { ApiProperty } from '@nestjs/swagger'
import { TransactionType } from '@/modules/common/dto/general.dto'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'
import { DataTableParams } from '@/common/params/DataTableParams'

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  bankName: string

  @IsString()
  @IsNotEmpty()
  bankAccount: string

  @IsEnum(TransactionType)
  @IsNotEmpty()
  transactionType: TransactionType

  @IsString()
  @IsNotEmpty()
  content: string

  @IsString()
  @IsNotEmpty()
  reference: string

  @IsString()
  @IsOptional()
  txCode?: string

  @IsString()
  @IsOptional()
  prefixCode?: string

  @IsString()
  @IsOptional()
  suffixCode?: string

  @IsNumber()
  @IsNotEmpty()
  amount: number

  @IsDate()
  @IsNotEmpty()
  transactionTime: Date

  @IsString()
  @IsNotEmpty()
  data: string

  @IsBoolean()
  @IsOptional()
  isManual?: boolean

  @IsString()
  @IsOptional()
  manualBy?: string

  @IsDate()
  @IsOptional()
  manualAt?: Date
}

export class GetTransactionsQueriesDto extends PaginationQueriesDto {
  @ApiProperty({
    enum: TransactionType,
    required: false
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type: TransactionType
}

export class TransactionListing extends DataTableParams {
  @ApiProperty()
  @IsOptional()
  type: string

  @ApiProperty()
  @IsOptional()
  isMatched: string

  @ApiProperty()
  @IsOptional()
  startDate: Date

  @ApiProperty()
  @IsOptional()
  endDate: Date
}
