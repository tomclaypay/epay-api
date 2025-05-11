import { SettingsService } from '@/modules/resources/settings/settings.service'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private SettingsService: SettingsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const settings = await this.SettingsService.getSettings()

    if (!settings.isUnderMaintenance) {
      return true
    }

    return false
  }
}
