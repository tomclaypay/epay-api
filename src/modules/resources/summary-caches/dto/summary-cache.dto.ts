import { IsDate, IsNumber, IsNotEmpty, IsBoolean } from 'class-validator'

export class CreateSummaryCacheDto {
  @IsNumber()
  @IsNotEmpty()
  balance: number

  @IsNumber()
  @IsNotEmpty()
  totalDepositAmount: number

  @IsNumber()
  @IsNotEmpty()
  totalWithdrawalAmount: number

  @IsNumber()
  @IsNotEmpty()
  totalCashoutAmount: number

  @IsNumber()
  @IsNotEmpty()
  totalDepositFee: number

  @IsNumber()
  @IsNotEmpty()
  totalWithdrawalFee: number

  @IsNumber()
  @IsNotEmpty()
  totalCashoutFee: number

  @IsDate()
  @IsNotEmpty()
  cacheTime: Date

  @IsNotEmpty()
  @IsBoolean()
  isCrypto: boolean
}
