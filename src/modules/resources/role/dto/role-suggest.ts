import { IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RoleSuggestDto {
  @IsOptional()
  @ApiProperty()
  keyword: string
}
