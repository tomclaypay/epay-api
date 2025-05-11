import { PaginationQueriesDto } from '@/modules/common/dto/pagination.dto'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator'
import { BankAccountType, BankName, BankStatus, BankType } from './general.dto'
import { DataTableParams } from '@/common/params/DataTableParams'

export class GetBanksQueriesDto extends PaginationQueriesDto {
  @ApiProperty({
    enum: BankAccountType,
    required: false
  })
  @IsOptional()
  @IsEnum(BankAccountType)
  accountType: BankAccountType

  @ApiProperty()
  @IsOptional()
  @IsEnum(BankStatus)
  status: BankStatus
}
export class CreateBankDto {
  @ApiProperty({
    enum: BankName,
    required: false
  })
  @IsEnum(BankName)
  bankName: BankName

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankAccount: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankAccountName: string

  @ApiProperty({
    enum: BankAccountType,
    required: false
  })
  @IsEnum(BankAccountType)
  bankAccountType: BankAccountType

  @ApiProperty({
    enum: BankType,
    required: false
  })
  @IsEnum(BankType)
  bankType: BankType

  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean
}

export class UpdateBankDto {
  @ApiProperty({
    enum: BankName,
    required: false
  })
  @IsEnum(BankName)
  @IsOptional()
  bankName: BankName

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankAccount: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankAccountName: string

  @ApiProperty({
    enum: BankAccountType,
    required: false
  })
  @IsEnum(BankAccountType)
  @IsOptional()
  bankAccountType: BankAccountType

  @ApiProperty({
    enum: BankType,
    required: false
  })
  @IsEnum(BankType)
  @IsOptional()
  bankType: BankType

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isEnabled: boolean
}
export class BankListing extends DataTableParams {
  @ApiProperty()
  @IsOptional()
  isEnabled: string

  @ApiProperty()
  @IsOptional()
  bankType: string
}
