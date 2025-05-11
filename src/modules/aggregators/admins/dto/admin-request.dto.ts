import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { Type } from 'class-transformer'

export class GetSummaryQueriesDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date
}
