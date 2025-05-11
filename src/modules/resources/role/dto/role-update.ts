import { IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RoleUpdateDto {
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
  permissionIdList: string

  @IsOptional()
  @ApiProperty()
  permissions: Array<any>

  @IsOptional()
  @ApiProperty()
  isDeleted: string
}
