import { IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RoleCreateDto {
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
  isDeleted: string

  @IsOptional()
  @ApiProperty()
  permissionIdList: Array<any>

  @IsOptional()
  @ApiProperty()
  permissions: Array<any>
}
