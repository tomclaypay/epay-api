import { IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class PermissionCreateDto {
  @IsNotEmpty()
  @ApiProperty()
  title: string

  @IsNotEmpty()
  @ApiProperty()
  key: string

  @IsOptional()
  @ApiProperty()
  description: string

  @IsOptional()
  @ApiProperty()
  isDeleted: boolean
}
