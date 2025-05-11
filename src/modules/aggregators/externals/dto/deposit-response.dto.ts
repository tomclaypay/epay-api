import { ApiProperty } from '@nestjs/swagger'

export class DepositData {
  @ApiProperty()
  id: string

  @ApiProperty()
  amount: number

  @ApiProperty()
  code: string

  @ApiProperty()
  status: string

  @ApiProperty()
  ref: string

  @ApiProperty()
  hashId: string

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
  hashId: string

  @ApiProperty()
  callback: string

  @ApiProperty()
  status: string

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

  @ApiProperty({ type: [DepositDetail] })
  data: DepositDetail[]
}
