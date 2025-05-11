import { PermissionService } from '@/modules/resources/permission/permission.service'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<string>(
      'permission',
      context.getHandler()
    )

    if (!permission) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user

    const { role } = user

    if (role) {
      return await this.permissionService.checkPermission(role, permission)
    }

    return false
  }
}
