import { forwardRef, Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { PermissionModule } from '@/modules/resources/permission/permission.module'

import { RoleService } from './role.service'
import { RoleSchema } from '@/modules/resources/role/role.schema'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Role', schema: RoleSchema, collection: 'roles' }
    ]),
    forwardRef(() => PermissionModule)
  ],
  controllers: [],
  providers: [RoleService],
  exports: [RoleService]
})
export class RoleModule {}
