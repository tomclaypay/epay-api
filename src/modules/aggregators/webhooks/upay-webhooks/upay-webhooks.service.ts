import { UpayWebhookDto } from '@/modules/aggregators/webhooks/upay-webhooks/dto/request.dto'
import { DepositOrderType, OrderStatus } from '@/modules/common/dto/general.dto'
import { CustomerWalletsService } from '@/modules/resources/customer-wallets/customer-wallets.service'
import { DepositsService } from '@/modules/resources/deposits/deposits.service'
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
    private readonly customerWalletsService: CustomerWalletsService
  ) {}

  async onModuleInit() {
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

    const customer = await this.customerWalletsService.getCustomerWalletById(
      upayWebhookDto.customerId
    )

    if (!customer) {
      return
    }

    const depositOrder = await this.depositsService.createDepositOrderByCrypto({
      usdtAmount: upayWebhookDto.amount,
      callback: customer.callback,
      mt5Id: customer.mt5Id,
      status: OrderStatus.Succeed,
      chainName: upayWebhookDto.chainName,
      txHash: upayWebhookDto.txHash,
      usdtFee: upayWebhookDto.fee,
      customerWallet: customer.id,
      upayOrderRef: upayWebhookDto.orderId
    })

    this.depositsService.sendDepositCallback(
      customer.callback,
      DepositOrderType.CRYPTO,
      depositOrder.id,
      null,
      depositOrder.code,
      depositOrder.status,
      depositOrder.amount,
      depositOrder.usdtActualAmount
    )
  }

  async handleUpayWithdrawalWebhook(upayWebhookDto: UpayWebhookDto) {
    if (upayWebhookDto.status != 'SUCCEED') {
      console.log(
        '[UpayHookService][handleUpayWithdrawalWebhook]: invalid status'
      )
      return
    }

    const customer = await this.customerWalletsService.getCustomerWalletById(
      upayWebhookDto.customerId
    )

    if (!customer) {
      return
    }

    const withdrawalOrder =
      await this.withdrawalsService.getWithdrawalByUpayOrderRef(
        upayWebhookDto.orderId
      )

    const updateWithdrawalOrder =
      await this.withdrawalsService.updateWithdrawalOrderByCrypto(
        withdrawalOrder.id,
        {
          status: OrderStatus.Succeed,
          txHash: upayWebhookDto.txHash,
          usdtFee: upayWebhookDto.fee,
          customerWallet: customer.id
        }
      )

    this.withdrawalsService.sendWithdrawalCallback(
      customer.callback,
      DepositOrderType.CRYPTO,
      updateWithdrawalOrder.id,
      null,
      updateWithdrawalOrder.status,
      updateWithdrawalOrder.amount,
      updateWithdrawalOrder.usdtAmount
    )
  }
}
