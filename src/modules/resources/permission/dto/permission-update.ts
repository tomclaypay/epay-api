import { IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class PermissionUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  title?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  key?: string

  @ApiProperty()
  @IsOptional()
  roles?: Array<string>

  @ApiProperty()
  @IsOptional()
  description?: string

  @ApiProperty()
  @IsOptional()
  isDeleted?: boolean
}
