import { Module } from '@nestjs/common'
import { loadConfig } from '@/config'
import { DatabaseModule } from './modules/database/database.module'
import { AuthModule } from './modules/resources/auth/auth.module'
import { TasksModule } from './modules/tasks/tasks.module'
import { AdminsModule } from './modules/aggregators/admins/admins.module'
import { ExternalsModule } from './modules/aggregators/externals/externals.module'
import { SettingsModule } from './modules/resources/settings/settings.module'
import { InternalsModule } from './modules/aggregators/internals/internals.module'
import { VirtualWebhooksModule } from './modules/aggregators/webhooks/virtual-webhooks/virtual-webhooks.module'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    loadConfig(),
    SettingsModule,
    DatabaseModule,
    TasksModule,
    AuthModule,
    AdminsModule,
    ExternalsModule,
    InternalsModule,
    VirtualWebhooksModule,
    CacheModule.register({
      ttl: 10000, // milliseconds
      max: 10, // maximum number of items in cache
      isGlobal: true
    })
  ]
})
export class AppModule {}
