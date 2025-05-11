import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class LoadOrderInfoDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  merchantId: string

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  orderCode: string
}
