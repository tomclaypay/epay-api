import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PermissionService } from './permission.service'
import { PermissionSchema } from '@/modules/resources/permission/permission.schema'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Permission',
        schema: PermissionSchema,
        collection: 'permissions'
      }
    ])
  ],
  controllers: [],
  providers: [PermissionService],
  exports: [PermissionService]
})
export class PermissionModule {}
