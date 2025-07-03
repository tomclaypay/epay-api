import { VirtualWebhooksService } from '@/modules/aggregators/webhooks/virtual-webhooks/virtual-webhooks.service'
import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Webhook')
@Controller()
export class UpayWebhooksController {
  constructor(private virtualWebhooksService: VirtualWebhooksService) {}
}
