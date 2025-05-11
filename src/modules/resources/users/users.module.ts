import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersService } from './users.service'
import { AuthModule } from '@/modules/resources/auth/auth.module'
import { UserSchema } from './users.schema'
import { RoleModule } from '@/modules/resources/role/role.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema, collection: 'users' }
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => RoleModule)
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: []
})
export class UsersModule {}
