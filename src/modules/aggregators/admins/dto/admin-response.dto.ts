import { ApiProperty } from '@nestjs/swagger'

export class GetSummaryResponse {
  @ApiProperty()
  succeedDepositTotal: number

  @ApiProperty()
  pendingDepositTotal: number

  @ApiProperty()
  manualDepositTotal: number

  @ApiProperty()
  succeedDepositTotalAmount: number

  @ApiProperty()
  succeedDepositTotalFee: number

  @ApiProperty()
  succeedWithdrawalTotal: number

  @ApiProperty()
  pendingWithdrawalTotal: number

  @ApiProperty()
  succeedWithdrawalTotalAmount: number

  @ApiProperty()
  succeedWithdrawalTotalFee: number
}
