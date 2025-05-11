import { ApiProperty } from '@nestjs/swagger'

export class WithdrawalData {
  @ApiProperty()
  id: string

  @ApiProperty()
  bankNameDest: string

  @ApiProperty()
  bankAccountNumberDest: string

  @ApiProperty()
  bankAccountNameDest: string

  @ApiProperty()
  amount: number

  @ApiProperty()
  ref: string

  @ApiProperty()
  callback: string

  @ApiProperty()
  code: string

  @ApiProperty()
  status: string

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string
}

export class WithdrawalDetail extends WithdrawalData {
  @ApiProperty()
  isManual: boolean

  @ApiProperty()
  transaction: string

  @ApiProperty()
  note: string
}

export class GetWithdrawsResponse {
  @ApiProperty()
  total: number

  @ApiProperty()
  offset: number

  @ApiProperty()
  limit: number

  @ApiProperty({ type: [WithdrawalData] })
  data: WithdrawalData[]
}

export class WithdrawalBanksData {
  @ApiProperty()
  withdrawalBanks: string[]
}
