import {
  Body,
  Controller,
  Post,
  Request,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { VirtualWebhooksService } from './virtual-webhooks.service'
import {
  HandleCreateVAVov5WebhookDto,
  HandleTransferVov5WebhookDto,
  HandleVirtualWebhookDto,
  HandleXenditWebhookDto
} from './dto/request.dto'

@ApiTags('Webhook')
@Controller()
export class VirtualWebhooksController {
  constructor(private virtualWebhooksService: VirtualWebhooksService) {}

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('webhooks/virtual')
  async handleVirtualWebhook(
    @Body() handleVirtualWebhookDto: HandleVirtualWebhookDto
  ) {
    return this.virtualWebhooksService.handleVirtualWebhook(
      handleVirtualWebhookDto
    )
  }
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('webhooks/virtual/xendit')
  async handleXenditWebhook(
    @Body() handleXenditWebhookDto: HandleXenditWebhookDto
  ) {
    return this.virtualWebhooksService.handleXenditWebhook(
      handleXenditWebhookDto
    )
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('webhooks/vov5/create-va')
  async handleVov5Webhook(
    @Request() req,
    @Body() handleCreateVAVov5WebhookDto: HandleCreateVAVov5WebhookDto
  ) {
    return this.virtualWebhooksService.handleCreateVAVov5Webhook(
      handleCreateVAVov5WebhookDto
    )
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('webhooks/vov5/transfer')
  async handleTransferVov5Webhook(
    @Request() req,
    @Body() handleTransferVov5WebhookDto: HandleTransferVov5WebhookDto
  ) {
    return this.virtualWebhooksService.handleTransferVov5Webhook(
      handleTransferVov5WebhookDto
    )
  }
}
