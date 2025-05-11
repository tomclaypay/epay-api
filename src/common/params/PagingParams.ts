import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class PagingParams {
  @ApiProperty({ default: 0 })
  @IsOptional()
  page: number

  @ApiProperty({ default: 10 })
  @IsOptional()
  length: number

  @ApiProperty()
  @IsOptional()
  keyword: string
}
