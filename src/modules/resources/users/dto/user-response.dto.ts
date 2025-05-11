import { ApiProperty } from '@nestjs/swagger'

export class UserRoleData {
  @ApiProperty()
  _id: string

  @ApiProperty()
  key: string
}

export class UserRoleDetail {
  @ApiProperty()
  _id: string

  @ApiProperty({ type: [String] })
  permissions: string[]

  @ApiProperty()
  key: string

  @ApiProperty()
  title: string

  @ApiProperty()
  description: string

  @ApiProperty()
  isDeleted: boolean

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string
}

export class UserResponse {
  @ApiProperty()
  id: string

  @ApiProperty()
  username: string

  @ApiProperty()
  fullName: string

  @ApiProperty({ type: UserRoleData })
  role: UserRoleData

  @ApiProperty()
  active: boolean

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string
}

export class CreateUserResponse {
  @ApiProperty()
  id: string

  @ApiProperty()
  username: string

  @ApiProperty()
  fullName: string

  @ApiProperty({ type: UserRoleDetail })
  role: UserRoleDetail

  @ApiProperty()
  active: boolean

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string
}

export class GetUsersResponse {
  @ApiProperty()
  total: number

  @ApiProperty()
  offset: number

  @ApiProperty()
  limit: number

  @ApiProperty({ type: [UserResponse] })
  data: UserResponse[]
}
