import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import ipaddr from 'ipaddr.js'
import requestIp from 'request-ip'

@Injectable()
export class WhitelistIPGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const whitelistIPs = this.configService
      .get('WHITELIST_IP', '')
      .trim()
      .replace(/\s/g, '')
      .split(',')

    if (whitelistIPs.length == 0 || whitelistIPs[0] == '') {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const ipAddress = requestIp.getClientIp(request)
    const ipAddressV4 = ipaddr.process(ipAddress).toString()

    if (whitelistIPs.includes(ipAddressV4)) {
      return true
    }
    return false
  }
}
