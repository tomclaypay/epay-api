import { UpayWebhookDto } from '@/modules/aggregators/webhooks/upay-webhooks/dto/request.dto'
import { DepositOrderType, OrderStatus } from '@/modules/common/dto/general.dto'
import { CustomerWalletsService } from '@/modules/resources/customer-wallets/customer-wallets.service'
import { DepositsService } from '@/modules/resources/deposits/deposits.service'
import { SettingsService } from '@/modules/resources/settings/settings.service'
import { WithdrawalsService } from '@/modules/resources/withdrawals/withdrawals.service'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UpayWebhooksService {
  private upayApiSecret: string

  constructor(
    private readonly configService: ConfigService,
    private readonly depositsService: DepositsService,
    private readonly withdrawalsService: WithdrawalsService,
    private readonly customerWalletsService: CustomerWalletsService,
    private readonly settingsService: SettingsService
  ) {}

  async onModuleInit() {
    this.upayApiSecret = this.configService.get<string>('U_API_SECRET')
    // Initialization logic if needed
  }

  async handleUpayWebhook(upayWebhookDto: UpayWebhookDto) {
    console.log('upayWebhookDto', upayWebhookDto)
    if (this.upayApiSecret !== upayWebhookDto.secretKey) {
      console.log('[handleUpayWebhook] Invalid callback secret key')
      return
    }

    if (upayWebhookDto.orderType === 'DEPOSIT') {
      this.handleUpayDepositWebhook(upayWebhookDto)
    }

    if (upayWebhookDto.orderType === 'WITHDRAWAL') {
      this.handleUpayWithdrawalWebhook(upayWebhookDto)
    }
  }

  async handleUpayDepositWebhook(upayWebhookDto: UpayWebhookDto) {
    if (upayWebhookDto.status != OrderStatus.Succeed) {
      return
    }

    const customer =
      await this.customerWalletsService.getCustomerWalletByCustomerId(
        upayWebhookDto.customerId
      )

    if (!customer) {
      return
    }

    const settings = await this.settingsService.getSettings()

    const depositOrder = await this.depositsService.createDepositOrderByCrypto({
      usdAmount: upayWebhookDto.amount / settings.usdToUsdtRate || 1,
      callback: customer.callback,
      mt5Id: customer.mt5Id,
      status: OrderStatus.Succeed,
      chainName: upayWebhookDto.chainName,
      txHash: upayWebhookDto.txHash,
      usdFee: upayWebhookDto.fee / settings.usdToUsdtRate || 1 || 0,
      customerWallet: customer.id,
      upayOrderRef: upayWebhookDto.orderId,
      usdToUsdtRate: settings.usdToUsdtRate
    })

    this.depositsService.sendDepositCallback(
      customer.callback,
      DepositOrderType.CRYPTO,
      depositOrder.id,
      null,
      depositOrder.code,
      depositOrder.status,
      depositOrder.amount,
      depositOrder.usdActualAmount
    )
  }

  async handleUpayWithdrawalWebhook(upayWebhookDto: UpayWebhookDto) {
    if (upayWebhookDto.status != 'SUCCEED') {
      console.log(
        '[UpayHookService][handleUpayWithdrawalWebhook]: invalid status'
      )
      return
    }

    const customer =
      await this.customerWalletsService.getCustomerWalletByCustomerId(
        upayWebhookDto.customerId
      )

    if (!customer) {
      return
    }

    const settings = await this.settingsService.getSettings()

    const updateWithdrawalOrder =
      await this.withdrawalsService.updateWithdrawalOrderByCrypto(
        upayWebhookDto.orderRef,
        {
          status: OrderStatus.Succeed,
          txHash: upayWebhookDto.txHash,
          usdFee: upayWebhookDto.fee / settings.usdToUsdtRate || 1,
          customerWallet: customer.id
        }
      )

    this.withdrawalsService.sendWithdrawalCallback(
      customer.callback,
      'WITHDRAWAL',
      updateWithdrawalOrder.id,
      updateWithdrawalOrder.ref,
      updateWithdrawalOrder.code,
      updateWithdrawalOrder.status,
      updateWithdrawalOrder.amount,
      updateWithdrawalOrder.usdAmount
    )
  }
}
