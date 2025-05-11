import { ApiProperty } from '@nestjs/swagger'

export class DepositData {
  @ApiProperty()
  id: string

  @ApiProperty()
  amount: number

  @ApiProperty()
  actualAmount: number

  @ApiProperty()
  code: string

  @ApiProperty()
  isManual: boolean

  @ApiProperty()
  status: string

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string
}

export class DepositDetail {
  @ApiProperty()
  id: string

  @ApiProperty()
  amount: number

  @ApiProperty()
  actualAmount: number

  @ApiProperty()
  code: string

  @ApiProperty()
  ref: string

  @ApiProperty()
  callback: string

  @ApiProperty()
  transaction: string

  @ApiProperty()
  isManual: boolean

  @ApiProperty()
  status: string

  @ApiProperty()
  note: string

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string
}

export class GetDepositsResponse {
  @ApiProperty()
  total: number

  @ApiProperty()
  offset: number

  @ApiProperty()
  limit: number

  @ApiProperty({ type: [DepositData] })
  data: DepositData[]
}
