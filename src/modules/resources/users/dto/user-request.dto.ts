import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UserRole, UserStatus } from './general.dto'
import { PaginationQueriesDto } from '@/modules/common/dto/pagination.dto'

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string

  @ApiProperty()
  @IsNotEmpty()
  password: string

  @ApiProperty()
  @IsNotEmpty()
  fullName: string

  @ApiProperty()
  @IsNotEmpty()
  role: string

  @ApiProperty()
  @IsOptional()
  active: boolean
}

export class LoginDto {
  @IsNotEmpty()
  @ApiProperty()
  username: string

  @IsNotEmpty()
  @ApiProperty()
  password: string
}

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty()
  password: string

  @IsOptional()
  @ApiProperty()
  fullName: string

  @ApiProperty()
  @IsNotEmpty()
  role: string

  @ApiProperty()
  @IsOptional()
  active: boolean
}

export class GetUsersQueriesDto extends PaginationQueriesDto {
  @ApiProperty({
    enum: UserRole,
    required: false
  })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole

  @ApiProperty({
    enum: UserStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus
}
