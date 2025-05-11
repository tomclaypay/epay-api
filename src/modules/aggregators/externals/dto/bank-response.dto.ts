import { BankName } from '@/modules/resources/banks/dto/general.dto'
import { ApiProperty } from '@nestjs/swagger'

export class BankData {
  @ApiProperty({ enum: BankName })
  bankName: BankName

  @ApiProperty()
  bankAccount: string

  @ApiProperty()
  bankAccountName: string
}
