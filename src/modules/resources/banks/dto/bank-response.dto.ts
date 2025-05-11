import { ApiProperty } from '@nestjs/swagger'
import { BankAccountType, BankName } from './general.dto'

export class BankData {
  @ApiProperty()
  id: string

  @ApiProperty()
  bankName: BankName

  @ApiProperty()
  bankAccount: string

  @ApiProperty()
  bankAccountName: string

  @ApiProperty()
  bankAccountType: BankAccountType

  @ApiProperty()
  balance: number

  @ApiProperty()
  enabled: boolean
}

export class BankDetail {
  @ApiProperty()
  id: string

  @ApiProperty()
  bankName: BankName

  @ApiProperty()
  bankAccount: string

  @ApiProperty()
  bankAccountName: string

  @ApiProperty()
  bankAccountType: BankAccountType

  @ApiProperty()
  balance: number

  @ApiProperty()
  enabled: boolean

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string
}

export class GetBanksResponse {
  @ApiProperty()
  total: number

  @ApiProperty()
  offset: number

  @ApiProperty()
  limit: number

  @ApiProperty({ type: [BankData] })
  data: BankData[]
}
