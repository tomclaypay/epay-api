import { ApiProperty } from '@nestjs/swagger'

export class TransactionData {
  @ApiProperty()
  id: string

  @ApiProperty()
  bankName: string

  @ApiProperty()
  bankAccount: string

  @ApiProperty()
  transactionType: string

  @ApiProperty()
  content: string

  @ApiProperty()
  code: string

  @ApiProperty()
  reference: string

  @ApiProperty()
  amount: number

  @ApiProperty()
  transactionTime: Date
}

export class TransactionDetail {
  @ApiProperty()
  id: string

  @ApiProperty()
  bankName: string

  @ApiProperty()
  bankAccount: string

  @ApiProperty()
  transactionType: string

  @ApiProperty()
  content: string

  @ApiProperty()
  code: string

  @ApiProperty()
  reference: string

  @ApiProperty()
  amount: number

  @ApiProperty()
  transactionTime: Date

  @ApiProperty()
  created_time: string

  @ApiProperty()
  updated_time: string
}

export class GetTransactionsResponse {
  @ApiProperty()
  total: number

  @ApiProperty()
  offset: number

  @ApiProperty()
  limit: number

  @ApiProperty({ type: [TransactionData] })
  data: TransactionData[]
}
