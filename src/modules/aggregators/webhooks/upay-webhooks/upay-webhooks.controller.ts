import { UpayWebhookDto } from '@/modules/aggregators/webhooks/upay-webhooks/dto/request.dto'
import { UpayWebhooksService } from '@/modules/aggregators/webhooks/upay-webhooks/upay-webhooks.service'
import { VirtualWebhooksService } from '@/modules/aggregators/webhooks/virtual-webhooks/virtual-webhooks.service'
import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Webhook')
@Controller()
export class UpayWebhooksController {
  constructor(private upayWebHookService: UpayWebhooksService) {}

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('webhooks/upay')
  async handleUpayWebhook(@Body() upayWebHookDto: UpayWebhookDto) {
    return this.upayWebHookService.handleUpayWebhook(upayWebHookDto)
  }
}
